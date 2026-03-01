import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
} from '@react-pdf/renderer';
import type { Quote } from '../../types';

// ─────────────────────────────────────────────────────────────────────────────
// BACKGROUND IMAGE ANALYSIS (from side-by-side screenshot comparison):
//
// The generated PDF shows:
//   - cover-bg.png renders as: light grey solar field landscape
//   - page-bg.png renders as:  large TFP logo + solar panel circle (teal/dark bg)
//
// The ORIGINAL reference PDF shows:
//   - Page 1 cover: dark navy/teal city skyline WITH TFP logo = page-bg.png
//   - Pages 2-6: barely-visible light solar field watermark = cover-bg.png @ ~0.08
//
// CONCLUSION: The filenames are SWAPPED from what we'd expect.
//   Cover page  → use page-bg.png  (full opacity — this IS the dark teal cover)
//   Inner pages → use cover-bg.png (opacity 0.08 — barely visible watermark)
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#ffffff',
        fontFamily: 'Helvetica',
    },

    // Cover bg: page-bg.png at full opacity = dark navy/teal with TFP logo
    bgCoverView: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
    },

    // Inner page bg: cover-bg.png at very low opacity = barely-visible solar field
    bgPageView: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        opacity: 0.08,
    },

    bgImage: {
        width: '100%',
        height: '100%',
    },

    // ── Cover layout ──────────────────────────────────────────────────────────
    // Original: text is LEFT-ALIGNED, positioned ~35% from top
    // under the TFP logo which is baked into the top of page-bg.png
    coverWrapper: {
        flex: 1,
        alignItems: 'flex-start',
        paddingTop: 190,
        paddingLeft: 40,
        paddingRight: 40,
    },
    coverTitle: {
        fontSize: 32,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 8,
        color: '#ffffff',
    },
    coverSubtitle: {
        fontSize: 26,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 6,
        color: '#ffffff',
    },
    coverSubtext: {
        fontSize: 12,
        color: '#ffffff',
        letterSpacing: 1.5,
    },

    // ── Content area ──────────────────────────────────────────────────────────
    contentArea: {
        paddingHorizontal: 45,
        paddingBottom: 60,
    },

    // ── Customer info ─────────────────────────────────────────────────────────
    customerInfoBlock: {
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'flex-end',
    },
    infoLabel: {
        width: 150,
        fontSize: 10,
        color: '#374151',
    },
    infoValue: {
        flex: 1,
        fontSize: 10,
        color: '#1f2937',
        borderBottomWidth: 1,
        borderBottomColor: '#888888',
        paddingBottom: 1,
    },

    // ── Body text ─────────────────────────────────────────────────────────────
    paragraph: {
        fontSize: 9.5,
        lineHeight: 1.6,
        marginBottom: 10,
        textAlign: 'justify',
        color: '#1f2937',
    },
    paragraphBold: {
        fontSize: 9.5,
        fontFamily: 'Helvetica-Bold',
        lineHeight: 1.4,
        marginBottom: 2,
        color: '#1f2937',
    },

    // ── Quotation table ───────────────────────────────────────────────────────
    tableTitle: {
        fontSize: 16,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        marginBottom: 16,
        color: '#1f2937',
    },
    table: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#98c160',
        borderStyle: 'solid',
    },
    tableRow: {
        flexDirection: 'row',
    },
    thCell: {
        padding: 7,
        backgroundColor: '#e9f4d9',
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: '#98c160',
        borderStyle: 'solid',
        textAlign: 'center',
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: '#1f2937',
    },
    sectionCell: {
        flex: 1,
        padding: 7,
        backgroundColor: '#d4edaa',
        borderBottomWidth: 1,
        borderColor: '#98c160',
        borderStyle: 'solid',
        textAlign: 'center',
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: '#1f2937',
    },
    tdCell: {
        padding: 7,
        backgroundColor: '#f8fbf5',
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: '#98c160',
        borderStyle: 'solid',
        fontSize: 9,
        textAlign: 'center',
        color: '#1f2937',
    },
    totalLabelCell: {
        flex: 1,
        padding: 7,
        backgroundColor: '#e9f4d9',
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: '#98c160',
        borderStyle: 'solid',
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'right',
        color: '#1f2937',
    },
    totalValueCell: {
        width: '20%',
        padding: 7,
        backgroundColor: '#e9f4d9',
        borderBottomWidth: 1,
        borderColor: '#98c160',
        borderStyle: 'solid',
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        color: '#1f2937',
    },

    // ── Terms ─────────────────────────────────────────────────────────────────
    pageHeader: {
        fontSize: 15,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        marginBottom: 16,
        color: '#1f2937',
    },
    section: {
        marginBottom: 11,
    },
    sectionTitle: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 3,
        color: '#1f2937',
    },
    bodyText: {
        fontSize: 9.5,
        lineHeight: 1.5,
        color: '#374151',
        marginBottom: 4,
    },
    bullet: {
        fontSize: 9.5,
        lineHeight: 1.5,
        marginLeft: 14,
        marginBottom: 3,
        color: '#374151',
    },
    numbered: {
        fontSize: 9.5,
        lineHeight: 1.5,
        marginLeft: 18,
        marginBottom: 3,
        color: '#374151',
    },

    // ── Checklist ─────────────────────────────────────────────────────────────
    checkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    checkBox: {
        width: 13,
        height: 13,
        borderWidth: 1,
        borderColor: '#374151',
        marginRight: 10,
        backgroundColor: '#ffffff',
    },
    checkLabel: {
        fontSize: 9.5,
        color: '#374151',
    },

    // ── Signatures ────────────────────────────────────────────────────────────
    sigContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 55,
    },
    sigBlock: {
        width: '40%',
    },
    sigLine: {
        borderTopWidth: 1,
        borderTopColor: '#333333',
        marginBottom: 5,
    },
    sigLabel: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        marginBottom: 14,
        color: '#1f2937',
    },
    sigFieldRow: {
        flexDirection: 'row',
        marginBottom: 7,
        alignItems: 'flex-end',
    },
    sigFieldLabel: {
        width: 40,
        fontSize: 10,
        color: '#1f2937',
    },
    sigFieldLine: {
        flex: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#999999',
    },
});

// ─── Category grouping ────────────────────────────────────────────────────────
const GROUPS: { label: string; keywords: string[] }[] = [
    { label: 'MAIN EQUIPMENTS', keywords: ['solar', 'panel', 'inverter', 'battery'] },
    { label: 'FABRICATED ITEMS', keywords: ['structure', 'elevated', 'combiner', 'box'] },
    { label: 'BREAKERS & SAFETY DEVICES', keywords: ['fuse', 'breaker', 'spd', 'safety'] },
    { label: 'CABLES & ACCESSORIES', keywords: ['cable', 'cabling', 'accessory', 'accessories', 'conduit'] },
    { label: 'SERVICES', keywords: ['installation', 'civil', 'service'] },
];

function getCategory(itemType: string): string {
    const lower = itemType.toLowerCase().replace(/_/g, ' ');
    for (const g of GROUPS) {
        if (g.keywords.some(k => lower.includes(k))) return g.label;
    }
    return 'OTHER';
}

// ─── Background components ────────────────────────────────────────────────────
// `fixed` on the View prevents @react-pdf from creating phantom blank pages.
//
// CoverBg uses page-bg.png (= dark teal TFP branded image) at FULL opacity.
// PageBg  uses cover-bg.png (= light solar field) at opacity 0.08 (barely visible).

function CoverBg() {
    return (
        <View style={styles.bgCoverView} fixed>
            <Image src="/assets/pdf/page-bg.png" style={styles.bgImage} />
        </View>
    );
}

function PageBg() {
    return (
        <View style={styles.bgPageView} fixed>
            <Image src="/assets/pdf/cover-bg.png" style={styles.bgImage} />
        </View>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────
interface QuotePDFProps {
    quote: Quote;
}

export function QuotePDF({ quote }: QuotePDFProps) {
    // System capacity
    const panelItems = (quote.items ?? []).filter(i => {
        const t = i.itemType.toLowerCase().replace(/_/g, ' ');
        return t.includes('solar') || t.includes('panel');
    });
    const guessWattage = (item: { itemName?: string; itemDescription?: string }): number => {
        const src = `${item.itemName ?? ''} ${item.itemDescription ?? ''}`;
        const m = src.match(/(\d{3,4})\s*[wW]/);
        return m ? parseInt(m[1], 10) : 585;
    };
    const totalW = panelItems.reduce((s, i) => s + i.quantity * guessWattage(i), 0);
    const systemCapacity = totalW > 0 ? (totalW / 1000).toFixed(1) : 'XXX';

    // Group items
    const grouped: { category: string; items: typeof quote.items }[] = [];
    for (const item of (quote.items ?? [])) {
        const cat = getCategory(item.itemType);
        const existing = grouped.find(g => g.category === cat);
        if (existing) existing.items!.push(item);
        else grouped.push({ category: cat, items: [item] });
    }

    const today = new Date().toLocaleDateString('en-GB');

    return (
        <Document>

            {/* ═══════════════════════════════════════════════ PAGE 1 — COVER */}
            <Page size="A4" style={styles.page}>
                <CoverBg />
                <View style={styles.coverWrapper}>
                    <Text style={styles.coverTitle}>INITIAL PROPOSAL</Text>
                    <Text style={styles.coverSubtitle}>{systemCapacity} kW Hybrid SYSTEM</Text>
                    <Text style={styles.coverSubtext}>SOLAR POWER GENERATION SYSTEM</Text>
                </View>
            </Page>

            {/* ═════════════════════════════════════ PAGE 2 — COVER LETTER */}
            <Page size="A4" style={styles.page}>
                <PageBg />
                <View style={[styles.contentArea, { paddingTop: 110 }]}>
                    <View style={styles.customerInfoBlock}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Customer/ Company Name:</Text>
                            <Text style={styles.infoValue}>{quote.customerName}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Email:</Text>
                            <Text style={styles.infoValue}>{quote.customerEmail ?? ''}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Phone:</Text>
                            <Text style={styles.infoValue}>{quote.customerPhone}</Text>
                        </View>
                    </View>

                    <Text style={[styles.paragraph, { marginTop: 4 }]}>Dear Sir/ Madam,</Text>
                    <Text style={styles.paragraph}>
                        Thank you for giving The Future Power (TFP) an opportunity to submit this proposal. We strive to provide
                        savings in your overall electricity consumption and manage your energy resources with Smart Energy System
                        you can get rid of noisy generators, inefficient UPS and can enjoy uninterrupted clean power supply.
                    </Text>
                    <Text style={styles.paragraph}>
                        TFP's principal inverter supplies solar power even during power outages. The TFP's all-embracing Solar
                        System has an energy monitoring software which can enable the consumer to reduce your electricity bill up
                        to ZERO. With the net metering package, should you avail it from your electricity supplier; you opt to sell
                        excess energy back to the grid translating it into a direct economic benefit.
                    </Text>
                    <Text style={styles.paragraph}>
                        Net Metering contributes towards bringing more energy cost efficiency by exporting excess energy back to
                        the grid. Excess energy produced is environment friendly since it is green energy being produced from
                        renewable resources. TFP's Solar System ({systemCapacity} KW Package) enables you to avail net metering
                        from your electric supply company.
                    </Text>
                    <Text style={styles.paragraph}>
                        After TFP System is installed at your premises, it is remotely monitored 24/7 through Network Operations
                        Center (NOC) by technical personnel to ensure smooth operations. In case of any technical issues; NOC
                        personnel remotely diagnose and take corrective actions, if needed, over the Internet, where on site visit
                        is not required.
                    </Text>
                    <Text style={styles.paragraph}>
                        The attached quotation is based on a standard package, as described. We look forward to helping you
                        achieve more energy independence, providing a good investment for years to come, and helping you make
                        a more positive environmental impact.
                    </Text>
                    <View style={{ marginTop: 20 }}>
                        <Text style={styles.paragraph}>Thanks &amp; Regards,</Text>
                        <Text style={styles.paragraphBold}>
                            {(quote as any).salesRepName ?? 'The Future Power Team'}
                        </Text>
                        {(quote as any).salesRepPhone
                            ? <Text style={styles.paragraph}>{(quote as any).salesRepPhone}</Text>
                            : null}
                    </View>
                </View>
            </Page>

            {/* ══════════════════════════════════ PAGE 3 — QUOTATION TABLE */}
            <Page size="A4" style={styles.page}>
                <PageBg />
                <View style={[styles.contentArea, { paddingTop: 110 }]}>
                    <Text style={styles.tableTitle}>QUOTATION</Text>
                    <View style={styles.table}>
                        <View style={styles.tableRow}>
                            <Text style={[styles.thCell, { width: '20%' }]}>DESCRIPTION</Text>
                            <Text style={[styles.thCell, { width: '25%' }]}>ITEMS DETAIL</Text>
                            <Text style={[styles.thCell, { width: '25%' }]}>SPECIFICATION</Text>
                            <Text style={[styles.thCell, { width: '15%' }]}>QUANTITY</Text>
                            <Text style={[styles.thCell, { width: '15%', borderRightWidth: 0 }]}>TOTAL</Text>
                        </View>
                        {grouped.map((group, gi) => (
                            <View key={gi}>
                                <View style={styles.tableRow}>
                                    <Text style={styles.sectionCell}>{group.category}</Text>
                                </View>
                                {group.items!.map((item, ii) => (
                                    <View style={styles.tableRow} key={ii}>
                                        <Text style={[styles.tdCell, { width: '20%' }]}>
                                            {item.itemType.replace(/_/g, ' ')}
                                        </Text>
                                        <Text style={[styles.tdCell, { width: '25%' }]}>
                                            {item.itemName}
                                        </Text>
                                        <Text style={[styles.tdCell, { width: '25%' }]}>
                                            {item.itemDescription ?? '-'}
                                        </Text>
                                        <Text style={[styles.tdCell, { width: '15%' }]}>
                                            {item.quantity}
                                        </Text>
                                        <Text style={[styles.tdCell, { width: '15%', borderRightWidth: 0 }]}>
                                            {item.totalPrice != null
                                                ? Number(item.totalPrice).toLocaleString()
                                                : '-'}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        ))}
                        <View style={styles.tableRow}>
                            <Text style={styles.totalLabelCell}>GRAND TOTAL:</Text>
                            <Text style={styles.totalValueCell}>
                                {Number(quote.finalAmount).toLocaleString()} /-
                            </Text>
                        </View>
                    </View>
                </View>
            </Page>

            {/* ══════════════════════════ PAGE 4 — TERMS & CONDITIONS (1/2) */}
            <Page size="A4" style={styles.page}>
                <PageBg />
                <View style={[styles.contentArea, { paddingTop: 110 }]}>
                    <Text style={styles.pageHeader}>TERMS &amp; CONDITIONS</Text>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Indicative Price:</Text>
                        <Text style={styles.bodyText}>
                            PKR {Number(quote.finalAmount).toLocaleString()}/- , which is based on USD-PKR exchange rate as at
                            the date of this quotation. The impact of any depreciation in PKR with respect to the USD-PKR
                            exchange rate forms part of the total product price and will be charged to the customer.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Price Validity:</Text>
                        <Text style={styles.bodyText}>
                            Price quoted is valid for 10 days from the date of quotation ({today}) or the date of
                            confirmation/acceptance of order by customer, whichever is the earlier.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Other Terms:</Text>
                        <Text style={styles.bodyText}>
                            All payments to be made by crossed cheque in the name of The Future Power. Order by Customer will be
                            deemed confirmed/accepted upon receipt of advance payment as per Payment Option selected by the
                            Customer. Final Price of System will be calculated on USD-PKR exchange rate as at the date of
                            installation or date of final payment by the customer. Balance, if any, due on account of exchange
                            rate variation shall be paid by Customer upon invoice raised by The Future Power before installation
                            of System at site.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Warranty:</Text>
                        <Text style={styles.bullet}>• 10 Years Inverter &amp; Battery Warranty.</Text>
                        <Text style={styles.bullet}>• 12 years Solar Panel manufacturing Warranty.</Text>
                        <Text style={styles.bullet}>• 25 years Solar Panel performance Warranty.</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Operation &amp; Maintenance:</Text>
                        <Text style={styles.bodyText}>
                            One (1) year free-of-cost O&amp;M services as per prevailing company policy. Thereafter, Customer
                            will be charged for O&amp;M subject to contract.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Cleaning Services:</Text>
                        <Text style={styles.bodyText}>
                            Three (3) month free-of-cost Solar Panel cleaning Service as per prevailing company policy.
                            Thereafter, Customer will be charged for cleaning service subject to contract.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Payment Option &amp; Delivery Timeline:</Text>
                        <Text style={styles.bullet}>• Option 1: Within 15 days from date of confirmation of order</Text>
                        <Text style={styles.bullet}>• 60% advance payment of Indicative Price</Text>
                        <Text style={styles.bullet}>• 30% On Day Of Material Delivery</Text>
                        <Text style={styles.bullet}>• 10% After Installation</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Net Metering:</Text>
                        <Text style={styles.bodyText}>
                            The Future Power will assist Customer in procuring Net Metering. The obligation to procure required
                            approvals rests with the Customer. In no circumstances shall The Future Power be held liable on any
                            account if the said approval is not granted by NEPRA. The Future Power will assist Customer to prepare
                            the required documentation for Net-Metering.
                        </Text>
                        <Text style={styles.sectionTitle}>Other Customer responsibilities for Net Metering include:</Text>
                        <Text style={styles.bullet}>• DC/AC Earthing</Text>
                        <Text style={styles.bullet}>• Meter Name change</Text>
                        <Text style={styles.bullet}>• Sanction load change</Text>
                        <Text style={styles.bullet}>• Net-Metering demand notice payment</Text>
                        <Text style={[styles.bodyText, { marginTop: 4 }]}>
                            Note: Fee for facilitation services rendered in Net-Metering will be charged separately at per actual.
                            It will be applicable as per the laws of NEPRA and local DISCO. This is an additional service for
                            customer support. Timeline for Net-Metering to be operational depends on the NEPRA/DISCO approvals.
                        </Text>
                    </View>
                </View>
            </Page>

            {/* ══════════════════════════ PAGE 5 — TERMS & CONDITIONS (2/2) */}
            <Page size="A4" style={styles.page}>
                <PageBg />
                <View style={[styles.contentArea, { paddingTop: 110 }]}>
                    <Text style={styles.pageHeader}>TERMS &amp; CONDITIONS</Text>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Scope of Work (Not Included):</Text>
                        <Text style={styles.bodyText}>Price does not include:</Text>
                        <Text style={styles.numbered}>i.    Cost of any civil works,</Text>
                        <Text style={styles.numbered}>ii.   Extra cable cost for length of cable beyond what is specified in Standard Scope of Work.</Text>
                        <Text style={styles.numbered}>iii.  Interconnection between one distribution box to another distribution box and switched works and costs;</Text>
                        <Text style={styles.numbered}>iv.   Customized solutions,</Text>
                        <Text style={styles.numbered}>v.    Special/Shed Type Structure,</Text>
                        <Text style={styles.numbered}>vi.   Out of City system delivery to site</Text>
                        <Text style={styles.numbered}>vii.  Meter name change,</Text>
                        <Text style={styles.numbered}>viii. Meter sanctioned load change and I&amp;C required other than the above-mentioned scope of work shall be charged as per actual.</Text>
                    </View>

                    <View style={[styles.section, { marginTop: 16 }]}>
                        <Text style={styles.sectionTitle}>
                            CUSTOMER CHECK LIST (Tick the boxes if you have the following):
                        </Text>
                        {[
                            'CNIC Copy / NTN Certificate',
                            'Last Month Bill Copy',
                            'Advance Payment Cheque',
                            'PV Layout Design',
                            'Sanction Load As Per System',
                            'Meter Name as Per Requirement',
                        ].map((label, i) => (
                            <View style={styles.checkRow} key={i}>
                                <View style={styles.checkBox} />
                                <Text style={styles.checkLabel}>{label}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </Page>

            {/* ════════════════════════════════ PAGE 6 — ACKNOWLEDGEMENTS */}
            <Page size="A4" style={styles.page}>
                <PageBg />
                <View style={[styles.contentArea, { paddingTop: 110 }]}>
                    <Text style={styles.pageHeader}>Acknowledgements</Text>

                    <Text style={styles.paragraph}>
                        I acknowledge and represent that I have read the terms and Conditions of this proposal and I fully
                        understand what is stated Herein. I expressly agree to all the terms and conditions set out Herein and to
                        adhere to all payment's obligations and other Ancillary obligations. In signing this proposal, I am not
                        relying on Any other representation made by the company to me.
                    </Text>

                    <View style={styles.sigContainer}>
                        <View style={styles.sigBlock}>
                            <View style={styles.sigLine} />
                            <Text style={styles.sigLabel}>Customer Sign</Text>
                            {(['Name:', 'Date:', 'CNIC:'] as const).map((lbl, i) => (
                                <View style={styles.sigFieldRow} key={i}>
                                    <Text style={styles.sigFieldLabel}>{lbl}</Text>
                                    <View style={styles.sigFieldLine} />
                                </View>
                            ))}
                        </View>
                        <View style={styles.sigBlock}>
                            <View style={styles.sigLine} />
                            <Text style={styles.sigLabel}>Sales Representative Sign</Text>
                            {(['Name:', 'Date:'] as const).map((lbl, i) => (
                                <View style={styles.sigFieldRow} key={i}>
                                    <Text style={styles.sigFieldLabel}>{lbl}</Text>
                                    <View style={styles.sigFieldLine} />
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </Page>

        </Document>
    );
}