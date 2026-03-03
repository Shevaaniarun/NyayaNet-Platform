/**
 * HYBRID Chatbot Service - AI-powered with intelligent fallback
 * Fallback: Comprehensive knowledge base for reliability
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

export type ChatMode = 'general' | 'argument' | 'prediction';

interface ChatResponse {
  message: string;
  context?: any;
  suggestions?: string[];
  mode?: ChatMode;
}

export class ChatbotService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private legalKnowledgeBase: Map<string, string>;
  private conversationContext: Map<string, any>;
  private useAI: boolean = true;

  constructor() {
    this.legalKnowledgeBase = new Map();
    this.conversationContext = new Map();
    this.initializeLegalKnowledge();
    
    try {
      const apiKey = process.env.AI_API_KEY;
      if (apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ 
          model: 'gemini-2.5-flash'
        });
        console.log('AI initialized successfully');
      } else {
        console.log('⚠️  No AI API key - using knowledge base only');
        this.useAI = false;
      }
    } catch (error) {
      console.error('⚠️  AI initialization failed - using knowledge base fallback');
      this.useAI = false;
    }
  }

  /**
   * Initialize comprehensive legal knowledge base
   */
  private initializeLegalKnowledge(): void {
    // Civil vs Criminal Law - COMPREHENSIVE
    this.legalKnowledgeBase.set('civil criminal difference', 
      '**Key Differences Between Civil Law and Criminal Law:**\n\n' +
      '**Civil Law:**\n' +
      '• **Purpose:** Compensation and resolution for the victim\n' +
      '• **Who Files:** Plaintiff (the person harmed)\n' +
      '• **Burden of Proof:** Preponderance of probabilities (51% certainty)\n' +
      '• **Outcome:** Monetary compensation, injunctions, specific performance\n' +
      '• **Examples:** Property disputes, contract breaches, divorce, torts\n' +
      '• **Standard:** "Balance of probabilities"\n' +
      '• **Parties:** Individual vs Individual/Organization\n\n' +
      '**Criminal Law:**\n' +
      '• **Purpose:** Punishment and deterrence of wrongdoing\n' +
      '• **Who Files:** State/Government (prosecution)\n' +
      '• **Burden of Proof:** Beyond reasonable doubt (99% certainty)\n' +
      '• **Outcome:** Imprisonment, fines, death penalty, probation\n' +
      '• **Examples:** Murder, theft, rape, assault, fraud, robbery\n' +
      '• **Standard:** "Beyond reasonable doubt"\n' +
      '• **Parties:** State vs Accused\n\n' +
      '**Important Notes:**\n' +
      '• Some acts can result in BOTH civil and criminal cases\n' +
      '• Example: Assault can lead to criminal prosecution AND civil suit for damages\n' +
      '• Criminal cases have stricter proof requirements to protect the innocent\n' +
      '• Civil cases focus on making the victim whole through compensation'
    );

    // Article 21 - Detailed
    this.legalKnowledgeBase.set('article 21', 
      '**Article 21 - Right to Life and Personal Liberty**\n\n' +
      '**Text:** "No person shall be deprived of his life or personal liberty except according to procedure established by law."\n\n' +
      '**Key Provisions:**\n' +
      '• Fundamental right available to all persons (citizens and non-citizens)\n' +
      '• Cannot be suspended even during emergency\n' +
      '• Includes "right to live with human dignity"\n\n' +
      '**Supreme Court Interpretations (Expanded Scope):**\n' +
      '• Right to livelihood and employment\n' +
      '• Right to privacy (landmark 2017 judgment)\n' +
      '• Right to free education up to age 14\n' +
      '• Right to clean environment and pollution-free air/water\n' +
      '• Right to health and medical care\n' +
      '• Right to shelter and housing\n' +
      '• Right to speedy trial\n' +
      '• Right against solitary confinement\n' +
      '• Right to legal aid\n\n' +
      '**Landmark Cases:**\n' +
      '• Maneka Gandhi v Union of India (1978) - Expanded interpretation\n' +
      '• Puttaswamy Judgment (2017) - Right to privacy\n' +
      '• Unni Krishnan v State of AP (1993) - Right to education\n\n' +
      '**Practical Significance:**\n' +
      'Article 21 is the most litigated fundamental right and has been used to protect citizens from state excess and ensure human dignity in all aspects of life.'
    );

    // Fundamental Rights - Complete
    this.legalKnowledgeBase.set('fundamental rights', 
      '**Fundamental Rights (Articles 12-35)**\n\n' +
      '**1. Right to Equality (Articles 14-18):**\n' +
      '• Article 14: Equality before law\n' +
      '• Article 15: Prohibition of discrimination\n' +
      '• Article 16: Equality of opportunity in employment\n' +
      '• Article 17: Abolition of untouchability\n' +
      '• Article 18: Abolition of titles\n\n' +
      '**2. Right to Freedom (Articles 19-22):**\n' +
      '• Article 19: Six freedoms (speech, assembly, association, movement, residence, profession)\n' +
      '• Article 20: Protection in criminal cases\n' +
      '• Article 21: Right to life and personal liberty\n' +
      '• Article 21A: Right to education (ages 6-14)\n' +
      '• Article 22: Protection against arrest and detention\n\n' +
      '**3. Right against Exploitation (Articles 23-24):**\n' +
      '• Article 23: Prohibition of human trafficking and forced labor\n' +
      '• Article 24: Prohibition of child labor (below 14 years)\n\n' +
      '**4. Right to Freedom of Religion (Articles 25-28):**\n' +
      '• Freedom of conscience and religion\n' +
      '• Freedom to manage religious affairs\n' +
      '• No religious instruction in state-funded schools\n\n' +
      '**5. Cultural and Educational Rights (Articles 29-30):**\n' +
      '• Protection of language, script, culture\n' +
      '• Right to establish educational institutions\n\n' +
      '**6. Right to Constitutional Remedies (Article 32):**\n' +
      '• Right to move Supreme Court for enforcement\n' +
      '• Dr. Ambedkar called it "Heart and Soul of Constitution"\n\n' +
      '**Key Points:**\n' +
      '• These rights are justiciable (enforceable in courts)\n' +
      '• Can be enforced through writs: Habeas Corpus, Mandamus, Prohibition, Certiorari, Quo Warranto\n' +
      '• Subject to reasonable restrictions\n' +
      '• Can be suspended during national emergency (except Articles 20-21)'
    );

    // IPC - Comprehensive
    this.legalKnowledgeBase.set('ipc', 
      '**Indian Penal Code (IPC) - 1860**\n\n' +
      '**Overview:**\n' +
      '• Primary criminal code of India\n' +
      '• Drafted by Lord Macaulay in 1860\n' +
      '• Contains 511 sections in 23 chapters\n' +
      '• Covers all substantive criminal law\n\n' +
      '**Major Chapters:**\n' +
      '• Offences against the State (Sections 121-130)\n' +
      '• Offences against public tranquility (Sections 141-160)\n' +
      '• Offences against human body (Sections 299-377)\n' +
      '• Offences against property (Sections 378-462)\n\n' +
      '**Important Sections:**\n' +
      '• **Section 302:** Murder (death penalty or life imprisonment)\n' +
      '• **Section 304:** Culpable homicide not amounting to murder\n' +
      '• **Section 307:** Attempt to murder\n' +
      '• **Section 376:** Rape (7 years to life imprisonment)\n' +
      '• **Section 420:** Cheating (up to 7 years imprisonment)\n' +
      '• **Section 498A:** Cruelty by husband/relatives\n' +
      '• **Section 120B:** Criminal conspiracy\n\n' +
      '**Recent Amendments:**\n' +
      '• 2013: Stringent rape laws (Nirbhaya Act)\n' +
      '• 2018: Death penalty for child rape\n' +
      '• Various sections for cybercrime added\n\n' +
      '*Note: IPC is being replaced by Bharatiya Nyaya Sanhita (BNS) from 2024*'
    );

    // CrPC
    this.legalKnowledgeBase.set('crpc', 
      '**Code of Criminal Procedure (CrPC) - 1973**\n\n' +
      '**Purpose:**\n' +
      'Procedural law for administration of criminal justice in India\n\n' +
      '**Key Provisions:**\n' +
      '• **Section 154:** FIR (First Information Report)\n' +
      '• **Section 156:** Police investigation powers\n' +
      '• **Section 161:** Examination of witnesses by police\n' +
      '• **Section 167:** Remand procedures\n' +
      '• **Section 125:** Maintenance to wife, children, parents\n' +
      '• **Section 320:** Compoundable offenses\n' +
      '• **Section 482:** Inherent powers of High Court\n\n' +
      '**Important Chapters:**\n' +
      '• Investigation and inquiry\n' +
      '• Arrest and bail\n' +
      '• Trial procedures\n' +
      '• Appeals and revisions\n\n' +
      '**Types of Offenses:**\n' +
      '• **Cognizable:** Police can arrest without warrant (murder, theft)\n' +
      '• **Non-cognizable:** Police need warrant (defamation, assault)\n' +
      '• **Bailable:** Accused has right to bail\n' +
      '• **Non-bailable:** Bail at court discretion'
    );

    // Constitution basics
    this.legalKnowledgeBase.set('constitution', 
      '**Constitution of India**\n\n' +
      '**Key Facts:**\n' +
      '• Adopted: 26 November 1949\n' +
      '• Came into force: 26 January 1950 (Republic Day)\n' +
      '• Longest written constitution in the world\n' +
      '• Originally: 395 Articles, 8 Schedules (now 470 Articles, 12 Schedules)\n\n' +
      '**Structure:**\n' +
      '• Preamble (soul of Constitution)\n' +
      '• 25 Parts\n' +
      '• 12 Schedules\n' +
      '• Over 100 amendments\n\n' +
      '**Key Features:**\n' +
      '• Federal structure with unitary bias\n' +
      '• Parliamentary form of government\n' +
      '• Independent judiciary\n' +
      '• Fundamental Rights (Part III)\n' +
      '• Directive Principles (Part IV)\n' +
      '• Fundamental Duties (Part IVA)\n\n' +
      '**Amendment Procedure (Article 368):**\n' +
      '• Simple majority for routine changes\n' +
      '• Special majority (2/3) for important provisions\n' +
      '• Ratification by states for federal provisions'
    );

    // Judicial System
    this.legalKnowledgeBase.set('judicial system', 
      '**Indian Judicial System**\n\n' +
      '**Hierarchy:**\n' +
      '1. **Supreme Court** (Apex)\n' +
      '   • Chief Justice + 33 judges\n' +
      '   • Original, appellate, advisory jurisdiction\n' +
      '   • Final court of appeal\n\n' +
      '2. **High Courts** (State level)\n' +
      '   • 25 High Courts in India\n' +
      '   • Original and appellate jurisdiction\n' +
      '   • Writ jurisdiction under Article 226\n\n' +
      '3. **District Courts**\n' +
      '   • District and Sessions Judge (criminal and civil)\n\n' +
      '4. **Subordinate Courts**\n' +
      '   • Magistrate Courts (criminal)\n' +
      '   • Civil Courts (civil matters)\n\n' +
      '**Special Features:**\n' +
      '• Single integrated system\n' +
      '• Independent of executive\n' +
      '• Power of judicial review\n' +
      '• Public Interest Litigation (PIL) allowed'
    );

    // Property Law
    this.legalKnowledgeBase.set('property', 
      '**Property Law in India**\n\n' +
      '**Transfer of Property Act, 1882:**\n' +
      '• Governs transfer of immovable property\n' +
      '• Modes: Sale, mortgage, lease, gift, exchange\n\n' +
      '**Property Registration:**\n' +
      '• Mandatory under Registration Act, 1908\n' +
      '• Register with Sub-Registrar office\n' +
      '• Stamp duty payment required\n\n' +
      '**Required Documents:**\n' +
      '• Sale deed / Agreement\n' +
      '• Title documents\n' +
      '• Encumbrance certificate (last 13-30 years)\n' +
      '• Property tax receipts\n' +
      '• Identity and address proofs\n\n' +
      '**Key Concepts:**\n' +
      '• Clear title verification essential\n' +
      '• Check for liens, mortgages, disputes\n' +
      '• Registration within 4 months of execution'
    );

    // Divorce/Marriage
    this.legalKnowledgeBase.set('divorce', 
      '**Divorce Laws in India**\n\n' +
      '**Governing Laws:**\n' +
      '• Hindu Marriage Act, 1955\n' +
      '• Muslim Personal Law\n' +
      '• Christian Marriage Act, 1872\n' +
      '• Special Marriage Act, 1954\n\n' +
      '**Grounds for Divorce (Hindu Law):**\n' +
      '• Adultery\n' +
      '• Cruelty (physical or mental)\n' +
      '• Desertion for 2+ years\n' +
      '• Conversion to another religion\n' +
      '• Mental disorder or insanity\n' +
      '• Leprosy\n' +
      '• Venereal disease\n' +
      '• Renunciation of world\n' +
      '• Presumption of death (missing 7+ years)\n\n' +
      '**Mutual Consent Divorce:**\n' +
      '• Both parties must agree\n' +
      '• Living separately for 1+ year\n' +
      '• 6-month waiting period (can be waived)\n' +
      '• Fastest divorce method\n\n' +
      '**Process:**\n' +
      '1. File petition in family court\n' +
      '2. Mandatory counseling sessions\n' +
      '3. Evidence and hearings\n' +
      '4. Final decree'
    );

    // Bail
    this.legalKnowledgeBase.set('bail', 
      '**Bail in India**\n\n' +
      '**Types:**\n' +
      '1. **Regular Bail:** After arrest (Section 437/439 CrPC)\n' +
      '2. **Anticipatory Bail:** Before arrest (Section 438 CrPC)\n' +
      '3. **Interim Bail:** Temporary, pending final decision\n\n' +
      '**Bailable vs Non-Bailable:**\n' +
      '• **Bailable:** Accused has right to bail (less serious crimes)\n' +
      '• **Non-bailable:** Court discretion (serious crimes like murder)\n\n' +
      '**Factors Courts Consider:**\n' +
      '• Nature and gravity of offense\n' +
      '• Severity of punishment\n' +
      '• Risk of absconding\n' +
      '• Tampering with evidence/witnesses\n' +
      '• Criminal antecedents\n' +
      '• Reasonable grounds for belief of guilt\n\n' +
      '**Recent Developments:**\n' +
      '• "Bail is rule, jail is exception" principle\n' +
      '• Speedy trial rights\n' +
      '• Cannot deny bail merely due to seriousness\n' +
      '• Personal liberty is paramount'
    );

    // Case Prediction knowledge
    this.legalKnowledgeBase.set('prediction intro',
      '**Case Prediction Mode**\n\n' +
      'I can help you analyze potential case outcomes based on:\n' +
      '• Similar past cases and precedents\n' +
      '• Relevant statutes and sections\n' +
      '• Strength of evidence\n' +
      '• Jurisdiction and court hierarchy\n' +
      '• Judicial trends\n\n' +
      'Please describe your case scenario in detail for analysis.'
    );

    // Argument Simulation knowledge
    this.legalKnowledgeBase.set('argument intro',
      '**Argument Simulation Mode**\n\n' +
      'I can help you prepare legal arguments by:\n' +
      '• Generating points for both sides\n' +
      '• Anticipating counter-arguments\n' +
      '• Citing relevant case laws\n' +
      '• Suggesting legal strategies\n\n' +
      'Describe your case and which side you want to argue for.'
    );
  }

  /**
   * MAIN PROCESSING - Tries AI first, falls back to knowledge base
   */
  async processMessage(
  message: string,
  userId?: string,
  mode: ChatMode = 'general'
): Promise<ChatResponse> {

  const normalizedMessage = message.toLowerCase().trim();

  // 1️⃣ Greeting
  if (this.isSimpleGreeting(normalizedMessage)) {
    return this.getGreetingResponse(mode);
  }

  // 2️⃣ AI Layer
  if (this.useAI && this.model) {
    try {

      // Argument Mode → 3-Pass Simulation
      if (mode === 'argument') {
        const debate = await this.runCourtroomSimulation(message);
        if (debate) {
          return {
            message: debate,
            context: { source: 'ai-3pass-simulation', model: '2.5-flash', mode },
            suggestions: this.generateSmartSuggestions(normalizedMessage, mode),
            mode
          };
        }
      }

      // General / Prediction → Single Pass AI
      const aiResponse = await this.getAIResponse(message, mode);

      if (aiResponse) {
        return {
          message: aiResponse,
          context: { source: 'ai-single-pass', model: '2.5-flash', mode },
          suggestions: this.generateSmartSuggestions(normalizedMessage, mode),
          mode
        };
      }

    } catch (error) {
      console.log('AI failed, falling back to knowledge base');
    }
  }

  // 3️⃣ Knowledge Base Fallback
  const kbResponse = this.searchKnowledgeBase(normalizedMessage, mode);
  if (kbResponse) {
    return {
      message: kbResponse,
      context: { source: 'knowledge_base', mode },
      suggestions: this.generateSmartSuggestions(normalizedMessage, mode),
      mode
    };
  }

  // 4️⃣ Final Default Fallback
  return this.getDefaultResponse(normalizedMessage, mode);
}

  /**
   * Get response from AI with mode-specific prompting
   */
  private async getAIResponse(message: string, mode: ChatMode): Promise<string | null> {
    try {
      let systemPrompt = '';

      switch (mode) {
        case 'general':
          systemPrompt = `
          You are NyayaNet AI – an expert Indian Legal Assistant.

          You MUST follow these rules strictly:

          1. Assume jurisdiction is India unless user specifies otherwise.
          2. Base answers strictly on Indian Constitution, IPC, CrPC, CPC, Evidence Act, and relevant Indian statutes.
          3. Cite specific Articles, Sections, or Acts wherever applicable.
          4. Structure every answer EXACTLY in this format:

          Introduction:
          Brief explanation of the concept (2–3 sentences).

          Legal Framework:
          Mention relevant Articles, Sections, Acts.

          Detailed Explanation:
          Explain clearly with practical interpretation.

          Practical Example (if applicable):
          Provide a simple real-world scenario.

          Important Notes:
          Mention exceptions, limitations, or recent developments.

          Conclusion:
          Summarize in 2–3 strong sentences.

          5. Keep response between 350–500 words.
          6. Do NOT use markdown symbols like #, *, -, or **.
          7. Maintain professional legal tone.
          8. Always end with:
          "This information is for educational purposes. Please consult a qualified lawyer for advice specific to your case."

          Be precise, authoritative, and legally grounded.
          `;
          break;

        case 'argument':
          systemPrompt = `
          You are NyayaNet AI – acting as a senior Indian courtroom advocate.

          You must simulate realistic Indian court arguments.

          Follow this structure strictly:

          Case Summary:
          Briefly restate facts based on user input.

          Prosecution / Plaintiff Arguments:
          - Cite relevant Sections/Articles.
          - Present 5 strong legal points.
          - Use courtroom-style persuasive language.

          Defense Arguments:
          - Present 5 counter-arguments.
          - Challenge evidence credibility.
          - Highlight procedural gaps.

          Rebuttal Strategy:
          How each side may attack the opponent’s arguments.

          Key Case Laws:
          Mention relevant Indian Supreme Court or High Court judgments if applicable.

          Strategic Advice:
          Practical courtroom tips.

          Keep tone confident and formal.
          Do NOT use markdown formatting.
          Always conclude with:
          "This is a simulated legal argument for educational purposes. Consult a practicing advocate for real case strategy."
          `;
          break;

        case 'prediction':
          systemPrompt = `
          You are NyayaNet AI – a legal outcome analyst trained in Indian judicial trends.

          You must analyze case outcome realistically using Indian legal standards.

          Follow this exact structure:

          Case Overview:
          Summarize key facts.

          Applicable Laws:
          Mention specific IPC/CrPC/Civil provisions.

          Evidence Strength Analysis:
          Evaluate strength of prosecution/plaintiff evidence (Strong/Moderate/Weak).
          Evaluate strength of defense evidence (Strong/Moderate/Weak).

          Risk Factors:
          Mention factors that may influence the judge’s decision.

          Judicial Trend Insight:
          Mention how Indian courts typically treat such cases.

          Probability Estimate:
          Give success probability in percentage.
          Example: Conviction probability: 65%
          Acquittal probability: 35%

          Confidence Score:
          Low / Moderate / High (based on evidence clarity).

          Estimated Timeline:
          General time expectation based on Indian courts.

          Conclude with:
          "This is predictive analysis based on legal principles and trends. Actual outcomes depend on court evaluation and evidence. Consult a lawyer for professional advice."

          Keep 400–500 words.
          No markdown formatting.
          Be analytical and realistic.
          `;
          break;
      }

      const fullPrompt = `${systemPrompt}\n\nUser Question: ${message}\n\nProvide a detailed, well-structured response:`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('AI error (full):', error);
      if (error?.response) {
        try {
          console.error('AI error response body:', JSON.stringify(error.response));
        } catch (e) {
          console.error('Could not stringify error.response', e);
        }
      }
      return null;
    }
  }

  private async runCourtroomSimulation(userMessage: string): Promise<string | null> {
  try {

    // PASS 1 – Prosecution
    const prosecutionPrompt = `
    You are a Public Prosecutor in an Indian court.

    Based on the following case description, generate strong prosecution arguments.

    Structure:
    Case Summary:
    Prosecution Arguments (5 strong legal points citing IPC/CrPC if applicable):
    Key Evidence Emphasis:
    Weaknesses in Defense:

    Case Description:
    ${userMessage}

    Use formal Indian courtroom tone.
    No markdown formatting.
    `;

    const prosecutionResult = await this.model.generateContent(prosecutionPrompt);
    const prosecutionText = (await prosecutionResult.response).text();


    // PASS 2 – Defense (Counter the above)
    const defensePrompt = `
    You are a Criminal Defense Advocate in an Indian court.

    Below are the prosecution arguments:

    ${prosecutionText}

    Now generate defense counter-arguments.

    Structure:
    Defense Strategy:
    Counter to Each Prosecution Point:
    Procedural Lapses:
    Doubts in Evidence:
    Legal Protections for Accused:

    Case Description:
    ${userMessage}

    Use persuasive courtroom language.
    No markdown formatting.
    `;

    const defenseResult = await this.model.generateContent(defensePrompt);
    const defenseText = (await defenseResult.response).text();


    // PASS 3 – Judge Perspective
    const judgePrompt = `
    You are a Sessions Court Judge in India.

    Below are arguments from both sides.

    Prosecution:
    ${prosecutionText}

    Defense:
    ${defenseText}

    Now provide:

    Judicial Analysis:
    Strength of Prosecution (Strong/Moderate/Weak with reasoning):
    Strength of Defense (Strong/Moderate/Weak with reasoning):
    Likely Outcome (without giving final verdict):
    Key Legal Issues Court Will Examine:

    Maintain neutral judicial tone.
    No markdown formatting.
    `;

    const judgeResult = await this.model.generateContent(judgePrompt);
    const judgeText = (await judgeResult.response).text();


    // Final Combined Output
    return `
    COURTROOM SIMULATION

    --- PROSECUTION SIDE ---
    ${prosecutionText}

    --- DEFENSE SIDE ---
    ${defenseText}

    --- JUDICIAL PERSPECTIVE ---
    ${judgeText}

    This is a simulated courtroom debate for educational purposes only. Consult a practicing advocate for real case strategy.
    `;

  } catch (error) {
    console.error('3-pass simulation failed:', error);
    return null;
  }
}

  /**
   * Search knowledge base with mode awareness
   */
  private searchKnowledgeBase(query: string, mode: ChatMode): string | null {
    // Check for civil vs criminal
    if ((query.includes('civil') && query.includes('criminal')) || 
        (query.includes('difference') && (query.includes('civil') || query.includes('criminal')))) {
      return this.legalKnowledgeBase.get('civil criminal difference') || null;
    }

    // Direct keyword matching
    for (const [key, value] of this.legalKnowledgeBase.entries()) {
      if (query.includes(key)) {
        return value;
      }
    }

    // Additional fuzzy matching
    if (query.includes('marry') || query.includes('marriage')) {
      return this.legalKnowledgeBase.get('divorce') || null;
    }

    if (query.includes('buy') || query.includes('sell') || query.includes('land')) {
      return this.legalKnowledgeBase.get('property') || null;
    }

    // Mode-specific fallbacks
    if (mode === 'prediction' && !this.legalKnowledgeBase.get('prediction intro')) {
      return 'Please describe your case in detail including the facts, applicable laws, and any evidence. I will analyze potential outcomes based on similar precedents and legal principles.';
    }

    if (mode === 'argument' && !this.legalKnowledgeBase.get('argument intro')) {
      return 'Please describe your case and specify which side you need arguments for. I will help generate strong legal arguments, anticipate counter-arguments, and suggest effective strategies.';
    }

    return null;
  }

  /**
   * Simple greeting check
   */
  private isSimpleGreeting(message: string): boolean {
    const greetings = ['hello', 'hi', 'hey', 'namaste', 'good morning', 'good afternoon', 'good evening'];
    return greetings.some(g => message === g || message.startsWith(g + ' '));
  }

  /**
   * Greeting response with mode awareness
   */
  private getGreetingResponse(mode: ChatMode): ChatResponse {
    const responses = {
      general: {
        message: 'Hello! I am your AI Legal Assistant powered by advanced AI. I can help you understand Indian laws, legal procedures, constitutional provisions, and much more. Feel free to ask any legal question!',
        suggestions: [
          'What is the difference between civil and criminal law?',
          'Explain Article 21',
          'What are fundamental rights?',
          'Tell me about IPC'
        ]
      },
      argument: {
        message: 'Welcome to Argument Simulation Mode! I can help you prepare legal arguments for your case. Describe your case scenario and specify which side you need arguments for (prosecution/plaintiff or defense).',
        suggestions: [
          'Help me argue a theft case for the prosecution',
          'Prepare defense arguments for a divorce case',
          'How to argue for anticipatory bail?',
          'Counter-arguments for Section 498A case'
        ]
      },
      prediction: {
        message: 'Welcome to Case Prediction Mode! Describe your case in detail including facts, applicable laws, and evidence. I will analyze potential outcomes based on precedents and legal principles.',
        suggestions: [
          'Predict outcome of a murder trial with circumstantial evidence',
          'Chances of getting bail in NDPS case',
          'Property dispute outcome analysis',
          'Success probability in divorce by mutual consent'
        ]
      }
    };

    return {
      message: responses[mode].message,
      suggestions: responses[mode].suggestions,
      mode
    };
  }

  /**
   * Default helpful response with mode awareness
   */
  private getDefaultResponse(query: string, mode: ChatMode): ChatResponse {
    const responses = {
      general: {
        message: '**I can help you with Indian law!**\n\n' +
          'I specialize in:\n' +
          '✓ Constitutional Law (Articles, Fundamental Rights)\n' +
          '✓ Criminal Law (IPC, CrPC)\n' +
          '✓ Civil Law (Contracts, Property, Family Law)\n' +
          '✓ Court System and Procedures\n' +
          '✓ Legal Rights and Remedies\n\n' +
          'Try asking specific questions like:\n' +
          '• "What is Article 21?"\n' +
          '• "Difference between civil and criminal law?"\n' +
          '• "How does bail work?"\n' +
          '• "What is IPC Section 420?"',
        suggestions: [
          'What is the difference between civil and criminal law?',
          'What are fundamental rights?',
          'Explain Article 21',
          'Tell me about the Indian Constitution'
        ]
      },
      argument: {
        message: '**Legal Argument Simulation**\n\n' +
          'To help you prepare effective legal arguments, please provide:\n' +
          '1. Type of case (criminal/civil)\n' +
          '2. Key facts of the case\n' +
          '3. Which side you represent (prosecution/plaintiff or defense)\n' +
          '4. Applicable laws if known\n' +
          '5. Any evidence or witnesses\n\n' +
          'For example: "I need arguments for the defense in a Section 302 murder case where the accused claims self-defense"',
        suggestions: [
          'Arguments for prosecution in theft case',
          'Defense arguments for domestic violence case',
          'How to argue for maintenance under Section 125 CrPC?',
          'Counter arguments for property dispute'
        ]
      },
      prediction: {
        message: '**Case Outcome Prediction**\n\n' +
          'For accurate case analysis, please provide:\n' +
          '1. Case type and applicable laws\n' +
          '2. Complete facts of the case\n' +
          '3. Evidence available for both sides\n' +
          '4. Current stage of proceedings\n' +
          '5. Jurisdiction (court name/location)\n\n' +
          'For example: "Analyze the chances of conviction in a Section 307 attempt to murder case with two eyewitnesses but no weapon recovery"',
        suggestions: [
          'Chances of conviction in dowry death case',
          'Bail prediction for NDPS case with 1kg cannabis',
          'Success rate for specific performance of contract',
          'Custody battle outcome prediction'
        ]
      }
    };

    return {
      message: responses[mode].message,
      suggestions: responses[mode].suggestions,
      mode
    };
  }

  /**
   * Generate smart suggestions based on mode
   */
  private generateSmartSuggestions(query: string, mode: ChatMode): string[] {
    const suggestions = {
      general: {
        default: [
          'What are fundamental rights?',
          'Difference between civil and criminal law',
          'What is Article 21?',
          'Explain IPC'
        ],
        civil: ['How to file a civil case?', 'What is CrPC?', 'Explain Section 498A'],
        criminal: ['What is IPC?', 'How to file a civil case?', 'What is CrPC?']
      },
      argument: {
        default: [
          'Arguments for prosecution in murder case',
          'Defense arguments for rape case',
          'How to argue for bail?',
          'Counter arguments for Section 498A'
        ],
        civil: ['Arguments for plaintiff in property dispute', 'Defense arguments for divorce', 'How to argue for maintenance?'],
        criminal: ['Prosecution strategy for theft', 'Defense arguments for assault', 'Bail arguments']
      },
      prediction: {
        default: [
          'Murder trial outcome with circumstantial evidence',
          'Chances of conviction in NDPS case',
          'Property dispute success probability',
          'Bail chances in cheating case'
        ],
        civil: ['Success rate in specific performance', 'Divorce by mutual consent timeline', 'Property partition chances'],
        criminal: ['Acquittal chances in rape case', 'Bail probability in murder', 'Sentence reduction chances']
      }
    };

    const modeSuggestions = suggestions[mode];
    
    if (query.includes('civil') || query.includes('property') || query.includes('divorce')) {
      return modeSuggestions.civil || modeSuggestions.default;
    }
    if (query.includes('criminal') || query.includes('murder') || query.includes('theft')) {
      return modeSuggestions.criminal || modeSuggestions.default;
    }
    
    return modeSuggestions.default;
  }
}