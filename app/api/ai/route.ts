import { NextResponse } from 'next/server';

const DEFAULT_GEMINI_KEY = 'AIzaSyCic-8hibtiEY2wbUMDj7YUwgDXw1yqXr4';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';

function parseInlineImage(dataUriOrBase64: string): { mimeType: string; data: string } | null {
  if (!dataUriOrBase64) return null;
  if (dataUriOrBase64.startsWith('data:')) {
    const matches = dataUriOrBase64.match(/^data:([^;]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      return { mimeType: matches[1], data: matches[2] };
    }
  }
  // Plain base64 string
  return { mimeType: 'image/jpeg', data: dataUriOrBase64 };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, brief, fileName, folderName, detectedAspect, topic, notes, category, messages, geminiKey, imageData } = body;

    const apiKey = geminiKey || process.env.GEMINI_API_KEY || DEFAULT_GEMINI_KEY;

    // Action 1: Smart Multimodal Asset & Campaign Analyzer
    if (action === 'analyze_upload') {
      const preferredAspect = detectedAspect || 'aspect-[16/10]';
      const sourceName = brief || folderName || fileName || 'Commercial Shoot';

      if (apiKey) {
        try {
          const promptText = `You are the lead Art Director & Brand Visual Designer assistant for Moiz Khan (Dubai/Worldwide).
Analyze this upload project context and artwork:
Folder/Collection: ${folderName || 'Single Asset'}
File Name: ${fileName || 'Asset'}
Brief/Concept: ${sourceName}
Detected Aspect Ratio: ${preferredAspect}

Output ONLY a raw valid JSON object (no markdown code fences, no extra text) with these exact keys:
{
  "code": "FILE_17.DIR",
  "name": "Punchy Director Project Title",
  "discipline": "Art Direction • Lookbook",
  "year": "2026",
  "role": "Lead Art Director",
  "aspect": "${preferredAspect}",
  "colorTag": "bg-[#ff3300]",
  "desc": "2-sentence high-impact directorial description highlighting technical lighting, composition, and visual tone.",
  "deliverables": ["Deliverable 1", "Deliverable 2", "Deliverable 3", "Deliverable 4"]
}`;

          const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [{ text: promptText }];
          const parsedImg = imageData ? parseInlineImage(imageData) : null;
          if (parsedImg) {
            parts.push({ inlineData: parsedImg });
          }

          const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts }],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const parsed = JSON.parse(text);
              if (preferredAspect) parsed.aspect = preferredAspect;
              return NextResponse.json({ success: true, data: parsed, engine: 'gemini-3.6-flash' });
            }
          }
        } catch (apiErr) {
          console.error('Gemini API call failed, falling back to heuristic engine', apiErr);
        }
      }

      // Intelligent Fallback Director Engine
      const cleanBrief = sourceName.trim();
      const codeNum = Math.floor(Math.random() * 80 + 17);
      const isFashion = /fashion|model|bridal|luxury|wear|cloth|vogue|runway/i.test(cleanBrief);
      const isTech = /aviation|flight|plane|speed|tech|auto|car|kinetic/i.test(cleanBrief);
      const isIdentity = /brand|identity|logo|type|swiss|poster|system/i.test(cleanBrief);

      let discipline = 'Art Direction • Commercial Shoot';
      let codeSuffix = 'DIR';
      let colorTag = 'bg-[#ff3300]';
      let aspect = preferredAspect || 'aspect-[16/10]';
      let role = 'Lead Art Director';

      if (isFashion) {
        discipline = 'Lighting Direction • Editorial Styling';
        codeSuffix = 'LUX';
        colorTag = 'bg-[#f59e0b]';
        role = 'Director of Visuals';
      } else if (isTech) {
        discipline = 'Art Direction • Lookbook';
        codeSuffix = 'DIR';
        colorTag = 'bg-[#0055ff]';
      } else if (isIdentity) {
        discipline = 'Brand Identity • Kinetic Strategy';
        codeSuffix = 'ID';
        colorTag = 'bg-[#00e575]';
        role = 'Creative Director';
      }

      let cleanedTitle = cleanBrief
        .replace(/[_-]+/g, ' ')
        .replace(/\.[a-zA-Z0-9]+$/, '')
        .trim();
      cleanedTitle = cleanedTitle.charAt(0).toUpperCase() + cleanedTitle.slice(1);

      const generated = {
        code: `FILE_${codeNum}.${codeSuffix}`,
        name: cleanedTitle,
        discipline,
        year: '2026',
        role,
        aspect,
        colorTag,
        desc: 'Tactile on-set visual direction capturing high-contrast textures, deliberate chiaroscuro practicals, and uncompromising technical composition. Built direct with founders and cinematographers.',
        deliverables: ['Creative Treatment', 'On-Set Lighting Scheme', 'Aspect Ratio Decks', 'Broadcast Master Grade'],
      };

      return NextResponse.json({ success: true, data: generated, engine: 'studio-director-engine' });
    }

    // Action 2: AI Editorial Article Writer
    if (action === 'write_article') {
      const topicText = topic || 'On-Set Lighting and Visual Architecture';
      const notesText = notes || 'Technical lighting, high-contrast frames, and authentic texture.';

      if (apiKey) {
        try {
          const prompt = `You are ghostwriting a high-fashion / commercial art direction journal post for Moiz Khan (Art Director & Brand Visual Designer based in Dubai).
Tone: Authoritative, surgical, tactile, Swiss modernist, practical, decisive.
Topic: ${topicText}
Category: ${category || 'LIGHTING & ON-SET'}
Rough Notes: ${notesText}

Return ONLY raw JSON with:
{
  "title": "Engaging headline",
  "subtitle": "Editorial subline",
  "excerpt": "Compelling 2-sentence summary",
  "slug": "kebab-case-slug",
  "readTime": "5 MIN READ",
  "category": "${category || 'LIGHTING & ON-SET'}",
  "specs": {
    "camera": "ARRI Alexa Mini LF • Cooke Anamorphic",
    "lighting": "Continuous Tungsten Practicals & Astera Wireless Tubes",
    "aspectRatio": "16:9 Cinema & 4:5 Editorial Deck",
    "deliverables": ["Lighting Blueprint", "Shoot Direction", "ACES Color Bible"]
  },
  "content": [
    "Paragraph 1...",
    "Paragraph 2...",
    "Paragraph 3...",
    "Paragraph 4..."
  ]
}`;

          const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const article = JSON.parse(text);
              return NextResponse.json({ success: true, data: article, engine: 'gemini-3.6-flash' });
            }
          }
        } catch (apiErr) {
          console.error('Gemini article generation failed, using fallback', apiErr);
        }
      }

      const slug = topicText
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const generatedArticle = {
        title: topicText,
        subtitle: 'Directorial observations on precision, set dynamics, and commercial visual integrity.',
        excerpt: `A technical breakdown of how we approached ${topicText} without resorting to commercial clichés or digital shortcuts.`,
        slug: slug || `journal-${Date.now()}`,
        readTime: '5 MIN READ',
        category: category || 'LIGHTING & ON-SET',
        specs: {
          camera: 'ARRI Alexa Mini LF • Cooke Anamorphic /i',
          lighting: 'Continuous Tungsten Practicals & Astera Wireless Tubes',
          aspectRatio: '16:9 Cinema & 4:5 Editorial Deck',
          deliverables: ['Lighting Blueprint', 'Shoot Direction', 'ACES Color Bible'],
        },
        content: [
          'When directing commercial shoots, the difference between generic content and indelible brand visual architecture lies in restraint. Most productions compensate for a lack of conceptual clarity by flooding the set with excessive light and frantic camera movement.',
          `Our methodology for ${topicText} prioritized tactile materials and intentional shadows. ${notesText}`,
          'Directing cinematographers requires speaking in concrete technical values—foot-candles, shutter angle, lens breathing, and highlight rolloff—rather than subjective adjectives. By anchoring every setup in architectural fundamentals, you achieve a calm, decisive rhythm on set.',
          'The resulting work carries longevity because its visual authority was engineered in the camera frame, not patched together in post-production.',
        ],
      };

      return NextResponse.json({ success: true, data: generatedArticle, engine: 'studio-director-engine' });
    }

    // Action 3: Conversational Human Creative Co-Pilot with Multimodal Vision
    if (action === 'chat') {
      const history = messages || [];
      const lastUserMsg = history[history.length - 1]?.content || 'Hello';
      const fileNamesList: string[] = body.fileNames || [];
      const extraImages: string[] = body.additionalImages || [];

      if (apiKey) {
        try {
          const systemInstruction = `You are Moiz Khan's Senior Creative Producer & Co-Director (Dubai / Worldwide).
You collaborate directly with Moiz to curate, organize, and present his brand visual direction, cinematography, and design campaigns.

Tone & Style:
- Speak conversationally, warmly, and naturally like an experienced, passionate human colleague. Never sound like a robotic generic assistant.
- You have deep practical expertise in multi-channel commercial campaigns (Editorial Print Lookbooks, 9:16 vertical reels/stories, 1:1 Instagram carousels, panoramic e-commerce hero banners, retail OOH hoardings/billboards, ARRI/Cooke cinema setups, Swiss typography).
- When Moiz provides an artwork, folder, or collection of campaign assets (like Kaldhar with multiple pages, social posts, standees):
  1. Acknowledge the assets by name and group them into formats (Lookbook prints, social posts, retail standees, artboards).
  2. Point out specific visual strengths (typography hierarchy, lighting, color grading, textile contrast).
  3. Tell Moiz you can publish all these assets to his Infinite Canvas and Portfolio in 1 click, and ask him which visual should be the primary hero cover.
  4. Keep your responses crisp, engaging, structured, and easy to reply to in seconds.`;

          const contents = history.map((m: { role: string; content: string; image?: string }, index: number) => {
            const isLast = index === history.length - 1;
            let text = m.content || (m.image ? 'Please analyze this campaign artwork.' : '');
            if (isLast && fileNamesList.length > 0) {
              text += `\n\n[Campaign Assets Attached: ${fileNamesList.length} files: ${fileNamesList.slice(0, 25).join(', ')}]`;
            }

            const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
              { text },
            ];

            // If this message or the request has an attached image, attach it
            const targetImg = m.image || (isLast ? imageData : null);
            if (targetImg) {
              const parsed = parseInlineImage(targetImg);
              if (parsed) parts.push({ inlineData: parsed });
            }

            // If last message and there are extra images (up to 3), attach them for vision
            if (isLast && extraImages.length > 0) {
              for (const extraImg of extraImages.slice(0, 3)) {
                const parsed = parseInlineImage(extraImg);
                if (parsed) parts.push({ inlineData: parsed });
              }
            }

            return {
              role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
              parts,
            };
          });

          // Ensure contents has at least one part
          if (!contents.length) {
            const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
              { text: lastUserMsg || 'Hello!' },
            ];
            if (imageData) {
              const parsed = parseInlineImage(imageData);
              if (parsed) parts.push({ inlineData: parsed });
            }
            contents.push({ role: 'user', parts });
          }

          const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemInstruction }] },
              contents,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (reply) {
              return NextResponse.json({ success: true, reply, engine: 'gemini-3.6-flash' });
            }
          } else {
            const errData = await res.json();
            console.error('Gemini API error:', errData);
          }
        } catch (apiErr) {
          console.error('Gemini chat failed, using fallback', apiErr);
        }
      }

      // Directorial Heuristic Assistant Response
      let reply = `Hey Moiz! Analyzing your project standards:\n\n• **Directorial Focus**: Maintain tactile contrast, deliberate shadow placement, and Swiss grid restraint.\n• **Deliverable Breakdown**: Multi-format campaigns should be separated into dedicated containers: 16:9 for cinema & lookbooks, 4:5 for editorial decks, 9:16 for velocity mobile reels, and 21:9 for panoramic e-commerce hero banners.\n\nQuick question: Do you want to package this as an integrated 360° campaign with deliverable tabs, or deploy individual cards directly to the Infinite Canvas?`;

      if (/lighting|camera|set|shoot/i.test(lastUserMsg)) {
        reply = `For on-set lighting and direction, here is what works best:\n\n1. **Key Lighting**: Skim continuous warm tungsten (2K-3K) across primary textures to avoid flat digital reflection.\n2. **Fill Control**: Use negative black solids on the shadow side to maintain dramatic chiaroscuro falloff.\n3. **Optics**: 35mm / 50mm Anamorphic primes for gentle barrel curvature and organic lens breathing.\n\nShall we draft a technical breakdown article for the Journal?`;
      } else if (/upload|tag|file|manage|kaladhar/i.test(lastUserMsg)) {
        reply = `I'm ready to organize your campaign assets. Drop the artwork or image preview here and I'll analyze every format (print lookbooks, 9:16 stories, e-commerce banners) and ask you how you'd like them featured!`;
      }

      return NextResponse.json({ success: true, reply, engine: 'studio-director-engine' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('AI Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
