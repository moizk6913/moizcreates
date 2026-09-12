import { NextResponse } from 'next/server';

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

    const rawKey = geminiKey || process.env.GEMINI_API_KEY || '';
    const isRevokedKey = rawKey.includes('AIzaSyCic-8hibtiEY2wbUMDj7YUwgDXw1yqXr4');
    const apiKey = isRevokedKey ? (geminiKey && !geminiKey.includes('AIzaSyCic') ? geminiKey : '') : rawKey;

    // Action 0: Real-time API Key Verifier & Ping
    if (action === 'verify_key') {
      if (!apiKey) {
        return NextResponse.json({ success: false, reason: 'No API key provided or key was revoked.' });
      }

      for (const modelName of ['gemini-3.6-flash', 'gemini-flash-latest']) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': apiKey,
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'ping' }] }],
            }),
          });
          if (res.ok) {
            return NextResponse.json({ success: true, verified: true, model: modelName });
          } else {
            const errData = await res.json().catch(() => ({}));
            if (res.status === 400 && errData?.error?.message?.toLowerCase().includes('api key')) {
              return NextResponse.json({ success: false, error: errData?.error?.message || 'Invalid API key' });
            }
            if (res.status === 401 || res.status === 403) {
              return NextResponse.json({ success: false, error: errData?.error?.message || 'Google rejected key.' });
            }
            continue;
          }
        } catch (fetchErr: any) {
          return NextResponse.json({ success: false, error: fetchErr.message });
        }
      }
      return NextResponse.json({ success: false, reason: 'Models unavailable for this key.' });
    }

    // Action 0.5: Intelligent Upload-First Work Metadata & Relationship Suggester
    if (action === 'suggest_work_metadata') {
      const { files, existingProjects, existingDisciplines, existingTags } = body;
      const fileList = Array.isArray(files) ? files : [];

      if (!fileList.length) {
        return NextResponse.json({ success: true, suggestions: [] });
      }

      // Check if files share a common filename prefix/series pattern
      let detectedSeriesName: string | null = null;
      let shouldGroup = false;
      if (fileList.length > 1) {
        const cleanedNames = fileList.map((f: any) =>
          (f.fileName || '').replace(/\.[a-zA-Z0-9]+$/, '').replace(/[-_0-9]+$/, '').trim()
        );
        const first = cleanedNames[0];
        if (first && first.length > 2 && cleanedNames.every((n: string) => n.toLowerCase() === first.toLowerCase())) {
          shouldGroup = true;
          detectedSeriesName = first
            .replace(/[_-]+/g, ' ')
            .replace(/\b\w/g, (c: string) => c.toUpperCase()) + ' Series';
        }
      }

      // Try Gemini AI if API key available
      if (apiKey) {
        try {
          const filesSummary = fileList.slice(0, 8).map((f: any, idx: number) => ({
            index: idx,
            fileName: f.fileName,
            mediaType: f.mediaType || 'image',
            aspectRatio: f.dimensions?.aspectRatio || 'auto',
            orientation: f.dimensions?.orientation || 'auto',
            duration: f.dimensions?.duration,
          }));

          const projectsContext = (existingProjects || []).slice(0, 20).map((p: any) => ({
            id: p.id,
            title: p.title,
            client: p.client,
            tag: p.tag,
          }));

          const prompt = `You are the lead Art Director & Content Architect assistant for a world-class creative director portfolio.
A creative director just dropped ${fileList.length} files.

Files to analyze:
${JSON.stringify(filesSummary, null, 2)}

Existing Active Projects in the Archive:
${JSON.stringify(projectsContext, null, 2)}

Existing Disciplines:
${JSON.stringify(existingDisciplines || ['Art Direction', 'Motion', 'Editorial', 'Branding', 'Photography'])}

YOUR GOAL:
1. Suggest whether these files belong to an EXISTING PROJECT (only if high correlation in name, brand, or concept; calculate confidence 0.0 - 1.0). If they do not match an existing project, suggest null for projectId (Standalone Work is 100% valid!).
2. For each file, suggest its Work Type (e.g. "Reel", "Social Design", "Advertisement", "Branding", "Photography", "Print", "Horizontal Video", "Poster", "Motion Graphic", "Lookbook Frame").
3. Suggest 1-2 primary Disciplines from the discipline vocabulary.
4. If the files form a series/lookbook, suggest group title and type.

Return ONLY raw JSON with:
{
  "batchSuggestion": {
    "matchedProjectId": "project-id-or-null",
    "matchedProjectName": "Matched Title or null",
    "projectConfidence": 0.94,
    "groupSuggestion": {
      "shouldGroup": ${shouldGroup},
      "groupTitle": "${detectedSeriesName || 'Lookbook Series'}",
      "groupType": "lookbook"
    }
  },
  "items": [
    {
      "index": 0,
      "suggestedTitle": "Clean Editorial Title",
      "suggestedType": "Reel / Lookbook Frame / etc.",
      "suggestedDisciplines": ["Art Direction"],
      "suggestedTags": ["Fashion", "35mm"]
    }
  ]
}`;

          const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': apiKey,
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const parsed = JSON.parse(text);
              return NextResponse.json({ success: true, ...parsed, engine: 'gemini-flash' });
            }
          }
        } catch (geminiErr) {
          console.warn('Gemini suggestion failed, using heuristic engine:', geminiErr);
        }
      }

      // High-precision Heuristic Fallback Engine (Runs instantaneously with zero latency)
      const projectMatches: Record<string, { count: number; project: any }> = {};
      (existingProjects || []).forEach((p: any) => {
        const pSlug = (p.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!pSlug) return;
        fileList.forEach((f: any) => {
          const fName = (f.fileName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          if (fName.includes(pSlug)) {
            if (!projectMatches[p.id]) {
              projectMatches[p.id] = { count: 0, project: p };
            }
            projectMatches[p.id].count += 1;
          }
        });
      });

      let bestMatchedProject: any = null;
      let highestMatchCount = 0;
      Object.values(projectMatches).forEach(({ count, project }) => {
        if (count > highestMatchCount) {
          highestMatchCount = count;
          bestMatchedProject = project;
        }
      });

      const matchedProjectId = bestMatchedProject ? bestMatchedProject.id : null;
      const matchedProjectName = bestMatchedProject ? bestMatchedProject.title : null;
      const projectConfidence = bestMatchedProject ? Math.min(0.7 + (highestMatchCount / fileList.length) * 0.28, 0.98) : 0;

      const items = fileList.map((f: any, idx: number) => {
        const name = (f.fileName || '').replace(/\.[a-zA-Z0-9]+$/, '');
        const cleanTitle = name
          .replace(/[_-]+/g, ' ')
          .replace(/\b\w/g, (c: string) => c.toUpperCase())
          .trim();

        const isVideo = f.mediaType === 'video' || /\.(mp4|mov|webm)$/i.test(f.fileName || '');
        const aspect = f.dimensions?.aspectRatio || 'auto';
        const orientation = f.dimensions?.orientation || 'horizontal';

        let suggestedType = 'Photography';
        let suggestedDisciplines = ['Art Direction'];

        if (isVideo) {
          if (aspect === '9:16' || orientation === 'vertical') {
            suggestedType = 'Reel';
            suggestedDisciplines = ['Motion', 'Art Direction'];
          } else {
            suggestedType = 'Horizontal Video';
            suggestedDisciplines = ['Cinematography', 'Motion'];
          }
        } else {
          if (/print|a4|book|spread|magazine/i.test(name)) {
            suggestedType = 'Print Artwork';
            suggestedDisciplines = ['Editorial', 'Art Direction'];
          } else if (/brand|logo|identity|mark/i.test(name)) {
            suggestedType = 'Branding';
            suggestedDisciplines = ['Branding', 'Art Direction'];
          } else if (/ad|banner|billboard|campaign/i.test(name)) {
            suggestedType = 'Advertisement';
            suggestedDisciplines = ['Art Direction', 'Advertising'];
          } else if (aspect === '4:5' || orientation === 'vertical') {
            suggestedType = 'Lookbook Frame';
            suggestedDisciplines = ['Art Direction', 'Photography'];
          } else if (aspect === '1:1') {
            suggestedType = 'Social Design';
            suggestedDisciplines = ['Art Direction'];
          } else {
            suggestedType = 'Photography';
            suggestedDisciplines = ['Art Direction', 'Photography'];
          }
        }

        return {
          index: idx,
          suggestedTitle: cleanTitle,
          suggestedType,
          suggestedDisciplines,
          suggestedTags: [cleanTitle.split(' ')[0] || 'Studio'],
        };
      });

      return NextResponse.json({
        success: true,
        batchSuggestion: {
          matchedProjectId,
          matchedProjectName,
          projectConfidence,
          groupSuggestion: {
            shouldGroup,
            groupTitle: detectedSeriesName || 'Lookbook Series',
            groupType: 'lookbook',
          },
        },
        items,
        engine: 'heuristic-studio-engine',
      });
    }

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

Intelligent Presentation Rule:
- If assets are print media, A4 pages, brochures, or lookbook layouts -> set layout: "book" (Double-Page Editorial Magazine Spread).
- If assets are 9:16 vertical ads, reels, or mobile stories -> set layout: "social" (Mobile Social Ads Bento).
- If mixed assets or multi-channel commercial campaign -> set layout: "bento" (360° Luxury Bento Grid).

Output ONLY a raw valid JSON object (no markdown code fences, no extra text) with these exact keys:
{
  "code": "FILE_17.DIR",
  "name": "Punchy Director Project Title",
  "discipline": "Art Direction • Lookbook",
  "year": "2026",
  "role": "Lead Art Director",
  "aspect": "${preferredAspect}",
  "layout": "book",
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
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': apiKey,
            },
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
              return NextResponse.json({ success: true, data: parsed, engine: 'gemini-2.0-flash' });
            }
          }
        } catch (apiErr) {
          console.error('Gemini API call failed, falling back to heuristic engine', apiErr);
        }
      }

      // Intelligent Fallback Director Engine
      const cleanBrief = sourceName.trim();
      const codeNum = Math.floor(Math.random() * 80 + 17);
      const isPrint = /print|a4|book|spread|lookbook|editorial|magazine|brochure|paper/i.test(cleanBrief);
      const isSocial = /social|ad|reel|story|meta|instagram|tiktok|feed/i.test(cleanBrief);
      const isFashion = /fashion|model|bridal|luxury|wear|cloth|vogue|runway|kaldhar|kaladhar/i.test(cleanBrief);
      const isTech = /aviation|flight|plane|speed|tech|auto|car|kinetic/i.test(cleanBrief);
      const isIdentity = /brand|identity|logo|type|swiss|poster|system/i.test(cleanBrief);

      let discipline = 'Art Direction • Commercial Shoot';
      let codeSuffix = 'DIR';
      let colorTag = 'bg-[#ff3300]';
      let aspect = preferredAspect || 'aspect-[16/10]';
      let role = 'Lead Art Director';
      let layout = 'bento';
      let deliverables = ['Creative Treatment', 'On-Set Lighting Scheme', 'Aspect Ratio Decks', 'Broadcast Master Grade'];

      if (isPrint) {
        discipline = 'Editorial Print & Lookbook Direction';
        codeSuffix = 'PRN';
        colorTag = 'bg-[#121212]';
        role = 'Art Director & Editorial Designer';
        layout = 'book';
        deliverables = ['A4 Print Editorial Lookbook', 'Double-Page Magazine Spreads', 'Directorial Master Plates', 'Tactile Print Production'];
      } else if (isSocial) {
        discipline = 'Social Media Ads & Campaign Graphics';
        codeSuffix = 'SOC';
        colorTag = 'bg-[#0055ff]';
        role = 'Art Director & Visual Designer';
        layout = 'social';
        deliverables = ['9:16 Vertical Story Ads', 'High-Velocity Motion Reels', 'Instagram Carousel Suites', 'Paid Media Visual Direction'];
      } else if (isFashion) {
        discipline = 'Editorial Direction • High Fashion & Bridal';
        codeSuffix = 'LUX';
        colorTag = 'bg-[#f59e0b]';
        role = 'Director of Visuals';
        layout = 'bento';
        deliverables = ['Haute Couture Lookbook', 'Social Media Motion Teasers', 'Hero Billboard Artboards', 'On-Set Lighting Design'];
      } else if (isTech) {
        discipline = 'Art Direction • Kinetic Lookbook';
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
        layout,
        colorTag,
        desc: isPrint
          ? `Tactile editorial print and lookbook architecture directed for ${cleanedTitle}. Formatted into deliberate double-page spreads, high-contrast chiaroscuro lighting, and Swiss modernist typography.`
          : 'Tactile on-set visual direction capturing high-contrast textures, deliberate chiaroscuro practicals, and uncompromising technical composition. Built direct with founders and cinematographers.',
        deliverables,
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
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': apiKey,
            },
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
      const lastUserMsg = (history[history.length - 1]?.content || 'Hello').trim();
      const lower = lastUserMsg.toLowerCase();
      const fileNamesList: string[] = body.fileNames || [];
      const extraImages: string[] = body.additionalImages || [];
      const customCampaigns: Array<{ name: string; discipline: string; deliverables?: number }> = body.campaigns || [];

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

          const candidateModels = [
            'gemini-3.6-flash',
            'gemini-flash-latest',
          ];

          for (const modelName of candidateModels) {
            try {
              const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-goog-api-key': apiKey,
                },
                body: JSON.stringify({
                  systemInstruction: { parts: [{ text: systemInstruction }] },
                  contents,
                }),
              });

              if (res.ok) {
                const data = await res.json();
                const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (reply) {
                  return NextResponse.json({ success: true, reply, engine: modelName });
                }
              } else {
                const errData = await res.json().catch(() => ({}));
                console.warn(`[Gemini API] ${modelName} returned status ${res.status}:`, errData?.error?.message || errData);
                if (res.status === 400 && errData?.error?.message?.toLowerCase().includes('api key')) break;
                if (res.status === 401 || res.status === 403) break;
                continue;
              }
            } catch (fetchErr) {
              console.warn(`[Gemini API] Error fetching ${modelName}:`, fetchErr);
            }
          }
        } catch (apiErr) {
          console.error('Gemini chat failed, using fallback', apiErr);
        }
      }

      // Directorial Heuristic Assistant Response (Aware of Moiz's actual projects & standards)
      let reply = `Hey Moiz! I'm here at your studio desk. Drop your lookbook plates, 16:9 widescreen banners, or reels right here, or ask me what projects we have active.`;

      if (
        lower.includes('what you have') ||
        lower.includes('what do you have') ||
        lower.includes('what do we have') ||
        lower.includes('what is uploaded') ||
        lower.includes('what campaigns') ||
        lower.includes('list') ||
        lower.includes('show campaign') ||
        lower.includes('show project') ||
        lower.includes('current project')
      ) {
        reply =
          `Right now in your studio, you have **4 live campaigns** ready on your portfolio:\n\n` +
          `• **Kaldhar Bridal**: 88 deliverables — 16:9 master widescreen banner first, 4:5 editorial lookbook plates (Frames 80–88), and the asymmetric bento spread at the end.\n` +
          `• **Easy Hai Bro**: Streetwear visual identity — 16:9 commercial cut, 4:5 key art, and 9:16 vertical motion reel.\n` +
          `• **Porsche Carrera Telemetry**: Automotive film — 16:9 widescreen tracking master and cockpit stills.\n` +
          `• **Windchasers Aviation**: Brand lookbook and dual-pilot flight deck motion.`;

        if (customCampaigns.length > 0) {
          reply +=
            `\n\nPlus **${customCampaigns.length} custom campaign(s)** in your library:\n` +
            customCampaigns.map((c) => `• **${c.name}**: ${c.discipline} (${c.deliverables || 1} deliverables)`).join('\n');
        }

        reply += `\n\nWhat would you like to do? We can add new deliverables to Kaldhar, adjust uncropped containers, or drop new files here to publish a fresh project!`;
      } else if (
        lower.includes('crop') ||
        lower.includes('size') ||
        lower.includes('cut') ||
        lower.includes('dimension') ||
        lower.includes('1920') ||
        lower.includes('aspect') ||
        lower.includes('uncrop')
      ) {
        reply =
          `Here is our uncropped visual architecture so your work is displayed with zero distortion:\n\n` +
          `• **1920×1080 (16:9)**: Master widescreen key art. Used for hero banners and cinematic film stills.\n` +
          `• **A4 / 4:5 (Portrait)**: Full-page editorial lookbook plates. Rendered with Apple continuous squircle corners.\n` +
          `• **9:16 (Vertical)**: Dedicated mobile velocity format for social reels and campaign motion.\n` +
          `• **Asymmetric Bento End Spread**: Automatically locks a 16:9 wide card (~65%) and a 4:5 portrait card (~35%) to the exact same flush height so there are no awkward cuts or blank white gaps.\n\n` +
          `Drop any mix of these into this chat and I will arrange them into uncropped containers automatically!`;
      } else if (
        lower.includes('kaldhar') ||
        lower.includes('kaladhar') ||
        lower.includes('bridal')
      ) {
        reply =
          `**Kaldhar Bridal** is set up with 88 total archived deliverables:\n\n` +
          `• **Lead Hero**: 16:9 master widescreen banner.\n` +
          `• **Deliverables Grid**: 4-column responsive gallery displaying Frames 80 through 88 with high-res lightbox view.\n` +
          `• **Signature Bento End Spread**: Flush 16:9 + 4:5 cards locked to the exact same height, with your editorial narrative on the left and logo on the right.\n` +
          `• **Commercial Motion**: Integrated commercial video reel.\n\n` +
          `If you want to add or swap any deliverables, simply drop the images or video here!`;
      } else if (
        lower.includes('how to upload') ||
        lower.includes('how do i') ||
        lower.includes('upload') ||
        lower.includes('backend') ||
        lower.includes('simple') ||
        lower.includes('help')
      ) {
        reply =
          `I made the backend upload workflow super simple for you:\n\n` +
          `1. **Attach Files**: Click the 📎 paperclip button or drag & drop your campaign visuals/videos into this chat.\n` +
          `2. **Set Name**: Type the campaign title (e.g. 'Kaldhar Bridal Lookbook').\n` +
          `3. **One-Click Publish**: Review the uncropped preview and hit the **🚀 Publish** button to go live instantly.\n\n` +
          `Or switch to the **⚡ Quick Upload** tab above if you prefer a direct form!`;
      } else if (
        lower.includes('delete') ||
        lower.includes('remove') ||
        lower.includes('clear')
      ) {
        reply =
          `To manage or delete campaigns:\n\n` +
          `• Switch to the **📂 Manage Campaigns** tab above.\n` +
          `• Click the red **🗑️ Delete** button on any campaign to remove it immediately from your portfolio.\n` +
          `• You can also delete custom campaigns directly from the Case Study modal on the live site!`;
      } else if (
        lower.includes('deploy') ||
        lower.includes('status') ||
        lower.includes('live') ||
        lower.includes('production')
      ) {
        reply =
          `Your portfolio is fully compiled and active on localhost!\n\n` +
          `• **All 10 Routes**: Ready for production deployment.\n` +
          `• **No Harsh Lines**: Strictly following your clean 'no line' design rule.\n` +
          `• **Palette**: Pure Red (#e60000), Black, and White (zero blue).\n` +
          `• **Apple Squircle Curvature**: Applied to all modal cards, buttons, and bento containers.`;
      } else if (
        lower.includes('cool') ||
        lower.includes('look cool') ||
        lower.includes('advice') ||
        lower.includes('improve') ||
        lower.includes('better') ||
        lower.includes('make website') ||
        lower.includes('make it')
      ) {
        reply =
          `Here are 4 directorial moves that make your portfolio look world-class:\n\n` +
          `• **Widescreen Key Visual Lead**: Always open campaigns with a full 1920×1080 cinematic banner. It establishes visual authority before showing editorial plates.\n` +
          `• **Signature Asymmetric Bento Spread**: Concluding with the 65% wide card + 35% portrait lookbook frame locked to the exact same flush height gives a bespoke, high-fashion agency feel.\n` +
          `• **Editorial Micro-Typography**: Crisp monospace frame markers (\`FRAME 80\`, \`88 FRAMES ARCHIVED\`) combined with bold Swiss titles reinforce precision craftsmanship.\n` +
          `• **Line-Free Contrast**: Keep the interface completely free of divider lines. Let deep blacks, subtle surface shifts, and vivid Red (#e60000) guide the eye naturally.`;
      } else if (
        /^(yo|hey|hi|hello|sup|whatsapp|whatapp|whatappp)/i.test(lower) ||
        lower.includes('how are you') ||
        lower.includes('how are u') ||
        lower.includes('hows it going') ||
        lower.includes('whats up') ||
        lower.includes('what up') ||
        lower.includes('whatapp') ||
        lower.includes('what are you doing')
      ) {
        reply =
          `Yo Moiz! What's good? Ready at your studio desk. We can organize campaign plates with zero cropping, review Kaldhar lookbook frames, or restructure your portfolio layouts. What are we directing today?`;
      } else if (
        lower.includes('who free gemini') ||
        lower.includes('where free') ||
        lower.includes('how to get') ||
        lower.includes('connect gemini') ||
        lower.includes('why not working') ||
        lower.includes('not working') ||
        lower.includes('not verking')
      ) {
        reply =
          `Google gives free Gemini AI directly through **Google AI Studio**! Here is how to get it in 30 seconds:\n\n` +
          `1. Open **[aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)** in your browser.\n` +
          `2. Sign in with your regular Google / Gmail account.\n` +
          `3. Click the blue **"Create API Key"** button.\n` +
          `4. Copy the key (it starts with \`AIzaSy...\`) and paste it right here in this chat!\n\n` +
          `Once you paste it, it will automatically connect and activate live Google Gemini for your studio!`;
      } else if (
        lower.includes('connect gemini') ||
        lower.includes('how to get api') ||
        lower.includes('get api key') ||
        lower.includes('how to connect')
      ) {
      } else if (
        lower.includes('color') ||
        lower.includes('red') ||
        lower.includes('black') ||
        lower.includes('blue')
      ) {
        reply =
          `Your visual identity is strictly locked to **Pure Red (#e60000)**, **Deep Black (#0d0d0e)**, and **Crisp White**. Zero blue is permitted anywhere on your portfolio. This high-contrast aesthetic creates a bold, luxury directorial presence.`;
      } else if (
        lower.includes('font') ||
        lower.includes('typography') ||
        lower.includes('text')
      ) {
        reply =
          `Your portfolio uses a high-impact typographic hierarchy: Bold uppercase Display Sans for primary titles and manifesto headings, paired with technical Swiss Monospace for frame tags, metadata, and timestamps.`;
      } else if (/lighting|camera|set|shoot/i.test(lastUserMsg)) {
        reply =
          `For on-set lighting and direction, here is what works best:\n\n` +
          `1. **Key Lighting**: Skim continuous warm tungsten (2K-3K) across primary textures to avoid flat digital reflection.\n` +
          `2. **Fill Control**: Use negative black solids on the shadow side to maintain dramatic chiaroscuro falloff.\n` +
          `3. **Optics**: 35mm / 50mm Anamorphic primes for gentle barrel curvature and organic lens breathing.`;
      }

      return NextResponse.json({ success: true, reply, engine: 'studio-director-engine' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('AI Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
