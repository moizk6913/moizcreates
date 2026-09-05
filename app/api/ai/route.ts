import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, brief, fileName, topic, notes, category, messages, geminiKey } = body;

    const apiKey = geminiKey || process.env.GEMINI_API_KEY || '';

    // Action 1: Smart Asset Upload Analyzer & Tagger
    if (action === 'analyze_upload') {
      if (apiKey) {
        try {
          const prompt = `You are the lead Art Director & Brand Visual Designer assistant for Moiz Khan (Dubai/Worldwide).
Analyze this upload brief:
File Name: ${fileName || 'Asset'}
Brief: ${brief || 'Commercial fashion / aviation / luxury shoot'}

Output ONLY a raw valid JSON object (no markdown code fences, no extra text) with these exact keys:
{
  "code": "FILE_17.DIR",
  "name": "Punchy Director Project Title",
  "discipline": "Art Direction • Lookbook",
  "year": "2026",
  "role": "Lead Art Director",
  "aspect": "aspect-[16/10]",
  "colorTag": "bg-[#ff3300]",
  "desc": "2-sentence high-impact directorial description highlighting technical lighting, composition, and visual tone.",
  "deliverables": ["Deliverable 1", "Deliverable 2", "Deliverable 3", "Deliverable 4"]
}`;

          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: 'application/json' },
              }),
            }
          );

          if (res.ok) {
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const parsed = JSON.parse(text);
              return NextResponse.json({ success: true, data: parsed, engine: 'gemini-1.5-flash' });
            }
          }
        } catch (apiErr) {
          console.error('Gemini API call failed, falling back to heuristic engine', apiErr);
        }
      }

      // Intelligent Built-in Fallback Director Engine
      const cleanBrief = (brief || fileName || 'Commercial Shoot').trim();
      const codeNum = Math.floor(Math.random() * 80 + 17);
      const isFashion = /fashion|model|bridal|luxury|wear|cloth/i.test(cleanBrief);
      const isTech = /aviation|flight|plane|speed|tech/i.test(cleanBrief);
      const isIdentity = /brand|identity|logo|type|swiss/i.test(cleanBrief);

      let discipline = 'Art Direction • Commercial Shoot';
      let codeSuffix = 'DIR';
      let colorTag = 'bg-[#ff3300]';
      let aspect = 'aspect-[16/10]';
      let role = 'Lead Art Director';

      if (isFashion) {
        discipline = 'Lighting Direction • Editorial Styling';
        codeSuffix = 'LUX';
        colorTag = 'bg-[#f59e0b]';
        aspect = 'aspect-[4/5]';
        role = 'Director of Visuals';
      } else if (isTech) {
        discipline = 'Art Direction • Lookbook';
        codeSuffix = 'DIR';
        colorTag = 'bg-[#0055ff]';
        aspect = 'aspect-[16/10]';
      } else if (isIdentity) {
        discipline = 'Brand Identity • Kinetic Strategy';
        codeSuffix = 'ID';
        colorTag = 'bg-[#00e575]';
        aspect = 'aspect-[1/1]';
        role = 'Creative Director';
      }

      const generated = {
        code: `FILE_${codeNum}.${codeSuffix}`,
        name: cleanBrief.charAt(0).toUpperCase() + cleanBrief.slice(1),
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
    "camera": "Camera setup",
    "lighting": "Lighting gear",
    "aspectRatio": "Framing spec",
    "deliverables": ["Item 1", "Item 2", "Item 3"]
  },
  "content": [
    "Paragraph 1",
    "Paragraph 2",
    "Paragraph 3",
    "Paragraph 4"
  ]
}`;

          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: 'application/json' },
              }),
            }
          );

          if (res.ok) {
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const parsed = JSON.parse(text);
              return NextResponse.json({ success: true, data: parsed, engine: 'gemini-1.5-flash' });
            }
          }
        } catch (apiErr) {
          console.error('Gemini article generation failed, using fallback', apiErr);
        }
      }

      // Built-in Editorial Fallback
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

    // Action 3: Interactive Studio Co-Pilot Chat
    if (action === 'chat') {
      const history = messages || [];
      const lastUserMsg = history[history.length - 1]?.content || 'Hello';

      if (apiKey) {
        try {
          const systemInstruction = `You are the private AI Studio Co-Pilot for Moiz Khan (Art Director & Brand Visual Designer, Dubai/Worldwide).
You assist Moiz in:
1. Managing uploads, organizing portfolio assets, and generating production tags.
2. Brainstorming shoot treatments, lighting schemes, and typography systems.
3. Writing sharp editorial articles for his standalone journal.
Tone: Minimalist, authoritative, knowledgeable in cinematography (ARRI, Cooke, tungsten, chiaroscuro), Swiss modernist typography, and high-impact commercial campaigns. Keep responses concise, organized with clean bullet points.`;

          const contents = history.map((m: { role: string; content: string }) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          }));

          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemInstruction }] },
                contents,
              }),
            }
          );

          if (res.ok) {
            const data = await res.json();
            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (reply) {
              return NextResponse.json({ success: true, reply, engine: 'gemini-1.5-flash' });
            }
          }
        } catch (apiErr) {
          console.error('Gemini chat failed, using fallback', apiErr);
        }
      }

      // Directorial Heuristic Assistant Response
      let reply = `Understood. Analyzing your request with Moiz Khan studio standards:\n\n• **Directorial Focus**: Maintain tactile contrast, deliberate shadow placement, and Swiss grid restraint.\n• **Asset Strategy**: Organize into archival file codes with dedicated aspect ratios (16:9 for cinema broadcast, 4:5 for editorial decks, 9:16 for velocity mobile reels).\n• **Next Action**: Use the **Upload & AI Auto-Tagger** tab above to ingest your stills or switch to the **AI Article Studio** to publish your shoot breakdown directly to the Journal.`;

      if (/lighting|camera|set|shoot/i.test(lastUserMsg)) {
        reply = `For on-set direction, I recommend:\n\n1. **Key Lighting**: Skim continuous warm tungsten (2K-3K) across primary textures to avoid flat digital reflection.\n2. **Fill Control**: Use negative black solids on the shadow side to maintain dramatic chiaroscuro falloff.\n3. **Optics**: 35mm / 50mm Anamorphic primes for gentle barrel curvature and organic lens breathing.\n\nReady to draft a technical breakdown article for the Journal?`;
      } else if (/upload|tag|file|manage/i.test(lastUserMsg)) {
        reply = `Asset management workflow active. Drop your image link or preview in the **Upload & AI Auto-Tagger** tab above. I will automatically classify its discipline, generate production codes (e.g., FILE_18.DIR), and format it for the Limitless Archive Canvas.`;
      }

      return NextResponse.json({ success: true, reply, engine: 'studio-director-engine' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('AI Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
