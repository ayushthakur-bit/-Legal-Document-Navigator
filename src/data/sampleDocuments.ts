import { SampleDocument } from "../types";

export const SAMPLE_DOCUMENTS: SampleDocument[] = [
  {
    id: "residential-lease",
    title: "Residential Apartment Lease Agreement",
    category: "Lease",
    tag: "Real Estate & Housing",
    description: "Standard landlord-drafted apartment lease with automatic 12-month renewal, entry clauses, and strict deposit forfeiture rules.",
    suggestedQuestions: [
      "Can the landlord enter my apartment without prior notice?",
      "What is the penalty if I need to terminate the lease early due to job relocation?",
      "What are my exact obligations regarding maintenance and repairs?",
      "Does this lease automatically renew, and how do I cancel it?",
    ],
    fullText: `RESIDENTIAL APARTMENT LEASE AGREEMENT

This Residential Lease Agreement (the "Agreement") is entered into as of October 1, 2025, by and between APEX METRO PROPERTIES LLC ("Landlord"), and the undersigned tenant(s) ("Tenant").

1. PREMISES & TERM
Landlord hereby leases to Tenant the premises known as Apartment 4B, 742 Evergreen Terrace, for a term of twelve (12) calendar months, commencing on November 1, 2025 (the "Commencement Date") and ending on October 31, 2026.

2. RENT & PAYMENT TERMS
Tenant agrees to pay monthly rent in the amount of $2,450.00 USD, payable strictly on or before the first (1st) day of each calendar month. Payments received after 11:59 PM on the third (3rd) calendar day shall incur an immediate and non-negotiable late fee of $150.00 USD, plus an ongoing penalty of $25.00 USD per day until full liquidation of the overdue balance.

3. SECURITY DEPOSIT
Tenant shall deposit with Landlord the sum of $4,900.00 USD (equivalent to two months' rent) as security for full performance. In the event Tenant vacates before the natural expiration of the term, or fails to provide the required notice under Section 4, Landlord shall retain the entire security deposit as pre-estimated liquidated damages without prejudice to any other remedies.

4. AUTOMATIC RENEWAL & NOTICE REQUIREMENT
UPON THE EXPIRATION OF THE INITIAL TERM, THIS AGREEMENT SHALL AUTOMATICALLY RENEW FOR AN ADDITIONAL SUCCESSIVE TWELVE (12) MONTH PERIOD AT A TEN PERCENT (10%) INCREASE IN BASE RENT, UNLESS TENANT PROVIDES WRITTEN NOTICE OF INTENT TO VACATE VIA CERTIFIED POST NOT LESS THAN SIXTY (60) CALENDAR DAYS PRIOR TO THE EXPIRATION DATE. ORAL NOTICE OR ELECTRONIC MAIL SHALL BE DEEMED NULL AND VOID.

5. RIGHT OF ENTRY & INSPECTION
Landlord, its agents, and prospective purchasers or future tenants shall have the absolute right to enter the Premises at all reasonable times. Landlord shall endeavor to provide twenty-four (24) hours informal notice; provided, however, that in circumstances deemed urgent by Landlord, or during the final forty-five (45) days of tenancy, Landlord may enter at any time without prior notification.

6. REPAIRS, ALTERATIONS & CASUALTY
Tenant shall be solely responsible for all minor repairs, drain clogs, plumbing fixtures, and glass replacement, regardless of cause, up to $350.00 USD per incident. Tenant shall not affix nails, paintings, or modify any fixtures without prior written consent.

7. INDEMNIFICATION & LIABILITY LIMITATION
Tenant agrees to indemnify, defend, and hold harmless Landlord and its managing agents from and against all liabilities, claims, personal injuries, water damage, or property losses occurring on or about the Premises. Landlord shall not be liable for any interruption of utility services or damage caused by pipe bursts, roof leaks, or third-party acts.

8. GOVERNING LAW & JURY TRIAL WAIVER
This Agreement shall be construed under the laws of the State. TENANT HEREBY IRREVOCABLY WAIVES ALL RIGHTS TO TRIAL BY JURY IN ANY ACTION, PROCEEDING, OR COUNTERCLAIM ARISING OUT OF THIS LEASE. IN ANY DISPUTE, TENANT SHALL PAY LANDLORD'S REASONABLE ATTORNEYS' FEES REGARDLESS OF THE FINAL JUDGMENT.`,
    comparisonPair: {
      id: "residential-lease-revised",
      title: "Tenant-Protected Lease Revision (Proposed Redline)",
      description: "Counter-draft introducing tenant rights: 30-day email renewal notice, mutual 24-hr entry requirement, capped late fees, and mutual legal fee recovery.",
      fullText: `RESIDENTIAL APARTMENT LEASE AGREEMENT (TENANT-PROTECTED VERSION)

This Residential Lease Agreement is entered into as of October 1, 2025, by and between APEX METRO PROPERTIES LLC ("Landlord"), and Tenant.

1. PREMISES & TERM
Premises: Apartment 4B, 742 Evergreen Terrace. Initial term of twelve (12) calendar months (November 1, 2025 through October 31, 2026).

2. RENT & PAYMENT TERMS
Monthly rent of $2,450.00 USD due on the first day of each month. A five (5) day grace period applies. If rent is unpaid by the 6th of the month, a reasonable late fee of $50.00 USD applies. No compounding daily fee.

3. SECURITY DEPOSIT
Security deposit of $2,450.00 USD (one month's rent) held in an interest-bearing escrow account. Landlord shall return the deposit within twenty-one (21) days of move-out, along with an itemized receipt of any lawful deductions for damage beyond normal wear and tear.

4. EXPIRATION & MONTH-TO-MONTH TRANSITION
Upon expiration of the initial term, the tenancy shall convert to a standard month-to-month agreement unless either party provides thirty (30) days advance written notice (email acceptable). Rent increases for subsequent terms are capped at the local Consumer Price Index (CPI) + 2%.

5. RIGHT OF ENTRY
Landlord may enter the Premises only with a minimum of twenty-four (24) hours advance written notice, between the hours of 9:00 AM and 6:00 PM on weekdays, except in verifiable emergencies involving imminent flood or fire.

6. REPAIRS & HABITABILITY
Landlord warrants that the Premises complies with all applicable housing codes and shall promptly repair all structural, electrical, heating, and plumbing defects at Landlord's sole expense, unless directly caused by Tenant's gross negligence.

7. MUTUAL LIABILITY & INSURANCE
Both parties agree to maintain appropriate insurance. Landlord remains responsible for damage resulting from building infrastructure failures, pipe bursts, or roof leaks.

8. DISPUTE RESOLUTION & ATTORNEYS' FEES
The prevailing party in any judicial proceeding shall be entitled to recover reasonable legal costs and attorneys' fees. Both parties retain all constitutional rights under local law.`,
    },
  },
  {
    id: "employment-agreement",
    title: "Executive & Tech Employment Agreement",
    category: "Employment",
    tag: "Workplace & Labor",
    description: "Corporate employment agreement containing expansive 24-month non-compete, comprehensive IP assignment over personal projects, and mandatory arbitration.",
    suggestedQuestions: [
      "Does the intellectual property assignment apply to my personal hobby projects created outside work hours?",
      "How restrictive is the non-compete clause if I leave the company?",
      "Can I be terminated without severance pay or advance notice?",
      "Am I required to pay for the company's arbitration costs if a dispute arises?",
    ],
    fullText: `EXECUTIVE EMPLOYMENT & CONFIDENTIALITY AGREEMENT

This Employment Agreement is entered into by VORTEX DYNAMICS INC. ("Employer" or "Company") and the prospective employee ("Employee").

1. POSITION & DUTIES
Employee shall serve as Senior Systems Architect and shall devote their full business time, energy, and exclusive loyalty to the Company, refraining from any external commercial ventures, advisory roles, or freelance engagements without express written approval from the Board.

2. COMPENSATION & AT-WILL STATUS
Employee shall receive an annualized base salary of $165,000 USD. Employment is strictly "at-will." Either party may terminate the employment relationship at any time, with or without cause, and with or without advance notice. Upon termination for any reason, Employee's right to unvested stock options or bonuses immediately ceases.

3. INTELLECTUAL PROPERTY & INVENTIONS ASSIGNMENT
Employee hereby assigns to Company all right, title, and interest in and to any and all inventions, codebases, software, discoveries, trade secrets, concepts, and designs conceived, developed, or reduced to practice by Employee, whether solely or jointly, DURING THE PERIOD OF EMPLOYMENT, REGARDLESS OF WHETHER CONCEIVED ON COMPANY TIME OR WITH COMPANY ASSETS, OR DEVELOPED ON EMPLOYEE'S OWN PERSONAL EQUIPMENT DURING NON-WORKING HOURS.

4. RESTRICTIVE COVENANTS & NON-COMPETITION
During the term of employment and for a period of twenty-four (24) months following the termination of employment for ANY reason:
(a) Employee shall not directly or indirectly engage in, advise, invest in, or provide services to any entity that competes with Company's current or contemplated lines of business within the United States or Canada.
(b) Employee shall not solicit, recruit, or attempt to hire any employee, contractor, or customer of Company.

5. NON-DISPARAGEMENT
Employee covenants that at no time, during or following employment, shall Employee publish, utter, or broadcast any statement, review, or commentary that could disparage or reflect negatively upon the Company, its executives, or its products.

6. MANDATORY BINDING ARBITRATION & CLASS ACTION WAIVER
All claims, disputes, or controversies arising out of this Agreement or Employee's employment shall be resolved exclusively by confidential, final, and binding arbitration administered by the American Arbitration Association in New York, NY. Employee knowingly waives any right to proceed in a court of law, trial by jury, or participation in any class or representative action.`,
    comparisonPair: {
      id: "employment-agreement-fair",
      title: "Fair Workplace Employment Agreement (Balanced Terms)",
      description: "Balanced alternative: California/modern standard limiting IP assignment to company-related work, 6-month non-solicitation only, and 2-week notice requirement.",
      fullText: `FAIR EMPLOYMENT & PROPRIETARY INFORMATION AGREEMENT

This Agreement is made by and between VORTEX DYNAMICS INC. ("Company") and Employee.

1. DUTIES & OUTSIDE ACTIVITIES
Employee will serve as Senior Systems Architect. Employee may engage in personal creative hobbies, open-source contributions, and non-conflicting activities during off-duty hours, provided they do not use Company confidential data or resources.

2. COMPENSATION & TERMINATION
Base salary: $165,000 USD. In the event of termination without cause by Company, Company will provide four (4) weeks written notice or four (4) weeks severance pay in lieu of notice, plus earned pro-rated bonus.

3. INTELLECTUAL PROPERTY CARVE-OUT
Inventions assignment applies strictly to inventions and software developed using Company equipment, or directly related to Company's proprietary core business. Inventions developed on personal time without Company trade secrets remain Employee's exclusive property (in compliance with statutory labor laws).

4. POST-EMPLOYMENT RESTRICTIONS
No post-employment non-compete covenant is imposed, recognizing Employee's fundamental right to pursue their livelihood. Employee agrees to a reasonable twelve (12) month non-solicitation of direct co-workers and customers.

5. MUTUAL PROFESSIONALISM
Both parties agree to treat each other professionally. Nothing herein prevents Employee from making truthful statements regarding unlawful workplace conduct or statutory labor rights.

6. DISPUTE RESOLUTION
Disputes will first be subject to good-faith mediation in Employee's local jurisdiction, with Company paying all administrative fees. Each party retains statutory employment protections.`,
    },
  },
  {
    id: "saas-master-services",
    title: "B2B SaaS Master Services Agreement (MSA)",
    category: "SaaS & Tech",
    tag: "Commercial Technology",
    description: "Enterprise SaaS agreement featuring asymmetrical liability caps, unilateral terms revision rights, and broad customer data licensing.",
    suggestedQuestions: [
      "Can the software vendor increase subscription prices without my consent?",
      "What is the vendor's maximum liability if they suffer a severe data breach?",
      "Who owns the analytical insights and telemetry generated from my company's data?",
      "What uptime guarantee or SLA credit remedies do I have if the system crashes?",
    ],
    fullText: `CLOUD METRIX ENTERPRISE MASTER SERVICES AGREEMENT (MSA)

This Master Services Agreement ("Agreement") governs the subscription and use of CloudMetrix Enterprise Services ("Services") by Customer ("Customer").

1. SUBSCRIPTION GRANT & RESTRICTIONS
Provider grants Customer a non-exclusive, non-transferable right to access and use the hosted Services during the Subscription Term solely for internal operations. Customer shall not reverse engineer or benchmark the platform.

2. SERVICE LEVEL AGREEMENT (SLA) & DOWNTIME
Provider targets a monthly system availability of 99.0%. Scheduled maintenance between 12:00 AM and 6:00 AM UTC is excluded from calculation. In the event monthly availability falls below 95.0%, Customer's SOLE AND EXCLUSIVE REMEDY shall be a service credit equal to 5% of that month's subscription fee, applied against future renewals.

3. FEES & UNILATERAL PRICE ADJUSTMENTS
Subscription fees are billed annually in advance and are non-refundable. Provider reserves the right to modify pricing tiers upon thirty (30) days notice. Continued use of the Services following such notice shall constitute binding acceptance of revised rates.

4. DATA RIGHTS & TELEMETRY USAGE
Customer retains ownership of raw Customer Data. Customer grants Provider an irrevocable, perpetual, royalty-free worldwide license to collect, aggregate, process, and train artificial intelligence models upon all anonymized telemetry, operational workflows, and usage patterns.

5. LIMITATION OF LIABILITY
TO THE MAXIMUM EXTENT PERMITTED BY LAW:
(a) IN NO EVENT SHALL PROVIDER BE LIABLE FOR ANY CONSEQUENTIAL, INDIRECT, SPECIAL, OR PUNITIVE DAMAGES, OR LOSS OF DATA, PROFITS, OR REVENUE.
(b) PROVIDER'S TOTAL AGGREGATE LIABILITY ARISING FROM ALL CLAIMS SHALL BE STRICTLY CAPPED AT THE LESSER OF $5,000.00 USD OR THE TOTAL FEES PAID BY CUSTOMER IN THE PRECEDING THREE (3) MONTHS.
(c) CUSTOMER'S INDEMNIFICATION AND PAYMENT OBLIGATIONS ARE NOT SUBJECT TO ANY LIABILITY CEILING.

6. SUSPENSION & TERMINATION
Provider may immediately suspend access without liability if Provider suspects any violation of acceptable use. Customer may terminate only for incurable material breach upon sixty (60) days written notice.`,
  },
  {
    id: "freelance-contractor",
    title: "Freelance Independent Contractor Agreement",
    category: "Freelance",
    tag: "Gig & Consulting",
    description: "Consultant agreement with delayed payment terms, unlimited client indemnification, and immediate work-for-hire rights transfer.",
    suggestedQuestions: [
      "When am I paid, and what happens if the client delays invoice payment?",
      "Do I transfer copyright before or after receiving full payment?",
      "Am I liable if the client's marketing campaign gets sued?",
      "What kill fee do I receive if the project is cancelled halfway?",
    ],
    fullText: `INDEPENDENT CONTRACTOR CONSULTING SERVICES AGREEMENT

This Agreement is made between NOVO BRANDS LLC ("Client") and the Independent Contractor ("Contractor").

1. SERVICES & MILESTONES
Contractor agrees to perform creative branding, design, and web development as outlined in Statements of Work (SOW). Contractor is an independent contractor and not an employee.

2. INVOICING & PAYMENT TERMS
Contractor shall submit invoices upon final milestone approval. Client shall pay approved invoices within Net sixty (60) calendar days. Client reserves the right to withhold up to 25% of any invoice if Client deems the creative output unsatisfactory in its sole discretion.

3. OWNERSHIP OF DELIVERABLES & WORK-FOR-HIRE
All creative works, code, graphics, and assets produced by Contractor shall be deemed "work made for hire" under US Copyright law. All worldwide rights, copyright, and title vest in Client IMMEDIATELY UPON CREATION, REGARDLESS OF WHETHER INVOICES HAVE BEEN SATISFIED OR PAID IN FULL.

4. WARRANTIES & INDEMNIFICATION
Contractor warrants that all deliverables are original and do not infringe any patent, trademark, or copyright. CONTRACTOR AGREES TO INDEMNIFY, DEFEND, AND HOLD HARMLESS CLIENT AND ITS AFFILIATES FROM ANY AND ALL LOSSES, CLAIMS, LIABILITIES, OR LEGAL EXPENSES (INCLUDING UNLIMITED ATTORNEYS' FEES) ARISING FROM OR RELATED TO CLIENT'S PUBLIC COMMERCIAL USE OF THE DELIVERABLES.

5. TERMINATION & CANCELLATION (KILL FEE)
Client may terminate this Agreement or any SOW at any time with forty-eight (48) hours notice. Contractor shall be paid only for completed, accepted hours up to the moment of notice. No kill fee, cancellation retainer, or anticipated profit shall be payable.`,
  },
  {
    id: "mutual-nda",
    title: "Non-Disclosure & Confidentiality Agreement",
    category: "Confidentiality (NDA)",
    tag: "Business & Partnerships",
    description: "Confidentiality agreement with perpetual trade secret restrictions, residual memory carve-outs, and injunctive relief clauses.",
    suggestedQuestions: [
      "How long do the confidentiality obligations last?",
      "Can the other party use general knowledge or memory retained by their team?",
      "What constitutes an authorized disclosure under subpoena?",
      "What are the immediate penalties if an inadvertent leak occurs?",
    ],
    fullText: `MUTUAL NON-DISCLOSURE AND PROPRIETARY INFORMATION AGREEMENT

This Mutual Non-Disclosure Agreement ("NDA") is entered into by and between ACME VENTURES INC. ("Party A") and PARTNER ("Party B") to explore potential commercial collaboration.

1. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" means all non-public information disclosed by either party, whether tangible, intangible, oral, or electronic, including financial data, product roadmaps, algorithms, customer lists, and business strategies.

2. OBLIGATION OF CONFIDENTIALITY
Each party agrees to hold all Confidential Information in strictest confidence, using at least the degree of care it uses for its own sensitive data (and not less than reasonable care), and shall not disclose it to any third party without prior written consent.

3. PERIOD OF RESTRICTION
Confidentiality obligations for general proprietary data shall endure for five (5) years from disclosure. For any information categorized as a trade secret, obligations shall endure in perpetuity until the information lawfully enters the public domain without fault.

4. RESIDUAL KNOWLEDGE CARVE-OUT
Notwithstanding anything to the contrary, the receiving party may freely use, in its general business operations, any ideas, concepts, or know-how retained in the unaided memory of personnel who had access to Confidential Information.

5. INJUNCTIVE RELIEF
The parties acknowledge that unauthorized disclosure causes irreparable harm for which monetary damages alone would be inadequate. The disclosing party shall be entitled to seek immediate injunctive relief and specific performance in any court of competent jurisdiction without the necessity of posting a bond.`,
  },
  {
    id: "commercial-invoice",
    title: "Commercial Tax Invoice (INV-1024)",
    category: "Invoice",
    tag: "Billing & Financial",
    description: "Enterprise services tax invoice INV-1024 with line items, tax rate, payment due date, and net 30 settlement terms.",
    suggestedQuestions: [
      "What is the invoice number and total amount payable?",
      "What is the due date and are there penalties for late payment?",
      "Who is the billing vendor and what services were provided?",
      "What tax identification and jurisdiction apply to this invoice?",
    ],
    fullText: `TAX INVOICE
INVOICE NUMBER: INV-1024
INVOICE DATE: 2026-09-19
DUE DATE: 2026-10-19
PAYMENT TERMS: Net 30 Days

ISSUER (VENDOR):
NovaTech Cloud Solutions Pvt. Ltd.
GSTIN: 27AABCN8921M1ZV
Sector 62, Cyber City, Gurugram, HR 122002

BILL TO (CLIENT):
Horizon Digital Enterprises
402 Pinnacle Tower, Bangalore, KA 560001
Client Account Ref: HZ-9912

LINE ITEMS & DELIVERABLES:
1. Enterprise Cloud Infrastructure Consulting (Sept 2026): ₹10,000.00
2. Security Vulnerability Scanning & Compliance Audit: ₹2,500.00

SUBTOTAL: ₹12,500.00
APPLICABLE TAX (GST @ 18% inclusive): ₹0.00 (Standard Consolidated)
TOTAL AMOUNT DUE: ₹12,500.00

PAYMENT INSTRUCTIONS & WIRE DETAILS:
Bank Name: Axis Bank Ltd.
A/C Name: NovaTech Cloud Solutions
A/C Number: 924010045892110
IFSC Code: UTIB0001422

TERMS & LEGAL NOTICE:
1. Payment is strictly due within 30 calendar days from invoice date (October 19, 2026).
2. Late payments beyond due date accrue interest at 1.5% per month on unpaid balance.
3. Any dispute regarding billable hours or deliverable acceptance must be raised in writing within ten (10) business days from invoice receipt.
4. Governing Jurisdiction: This transaction is subject to the exclusive jurisdiction of the competent courts of New Delhi.`,
  },
];
