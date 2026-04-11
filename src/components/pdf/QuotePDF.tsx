import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
    Font
} from '@react-pdf/renderer';
import type { Quote } from '../../types';

Font.register({
    family: 'Montserrat',
    fonts: [
        { src: `${window.location.origin}/assets/pdf/fonts/Montserrat-Regular.ttf`, fontWeight: 'normal' },
        { src: `${window.location.origin}/assets/pdf/fonts/Montserrat-Italic.ttf`, fontWeight: 'normal', fontStyle: 'italic' },
        { src: `${window.location.origin}/assets/pdf/fonts/Montserrat-Bold.ttf`, fontWeight: 'bold' },
        { src: `${window.location.origin}/assets/pdf/fonts/Montserrat-ExtraBold.ttf`, fontWeight: 800 },
    ]
});


const styles = StyleSheet.create({
    page: {
        backgroundColor: '#ffffff',
        fontFamily: 'Montserrat',
    },

    // Cover bg: page-bg.png at full opacity = dark navy/teal with TFP logo
    bgCoverView: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
    },

    // Inner page bg: image35.png is CLEAN (no hardcoded page numbers)
    bgPageView: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: -1,
    },

    bgImage: {
        width: '100%',
        height: '100%',
    },

    // ── Cover layout ──────────────────────────────────────────────────────────
    coverWrapper: {
        flex: 1,
        alignItems: 'center', // Centered horizontally
        paddingTop: 360, // Pushed down further to leave space below background text
        paddingHorizontal: 40,
    },
    coverSubtitle: {
        fontSize: 30,
        fontFamily: 'Montserrat',
        fontWeight: 'bold',
        letterSpacing: 1.0,
        marginBottom: 6,
        color: '#ffffff',
        textAlign: 'center',
    },

    // ── Content area ──────────────────────────────────────────────────────────
    contentArea: {
        paddingHorizontal: 85, // Increased for "middle" alignment
        paddingBottom: 85, /* Safely avoids the newly restored footer banner */
    },

    // ── Customer info ─────────────────────────────────────────────────────────
    customerInfoBlock: {
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 6,
        alignItems: 'flex-end',
    },
    infoLabel: {
        width: 150,
        fontSize: 9.5,
        color: '#000000',
    },
    infoValue: {
        flex: 1,
        fontSize: 9.5,
        color: '#000000',
        borderBottomWidth: 1,
        borderBottomColor: '#888888',
        paddingBottom: 1,
    },

    // ── Body text ─────────────────────────────────────────────────────────────
    paragraph: {
        fontSize: 9,
        lineHeight: 1.35,
        marginBottom: 8,
        textAlign: 'justify',
        color: '#000000',
    },
    paragraphBold: {
        fontSize: 9,
        fontFamily: 'Montserrat',
        fontWeight: 'bold',
        lineHeight: 1.3,
        marginBottom: 2,
        color: '#000000',
    },

    // ── Quotation table ───────────────────────────────────────────────────────
    tableTitle: {
        fontSize: 16,
        fontFamily: 'Montserrat',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
        color: '#000000',
    },
    table: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#72bf44',
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
        borderColor: '#72bf44',
        borderStyle: 'solid',
        textAlign: 'center',
        fontSize: 9,
        fontFamily: 'Montserrat',
        fontWeight: 'bold',
        color: '#000000',
    },
    sectionCell: {
        flex: 1,
        padding: 7,
        backgroundColor: '#d4edaa',
        borderBottomWidth: 1,
        borderColor: '#72bf44',
        borderStyle: 'solid',
        textAlign: 'center',
        fontSize: 9,
        fontFamily: 'Montserrat',
        fontWeight: 'bold',
        color: '#000000',
    },
    tdCell: {
        padding: 7,
        backgroundColor: '#f8fbf5',
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: '#72bf44',
        borderStyle: 'solid',
        fontSize: 9,
        textAlign: 'center',
        color: '#000000',
    },
    totalLabelCell: {
        flex: 1,
        padding: 7,
        backgroundColor: '#e9f4d9',
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: '#72bf44',
        borderStyle: 'solid',
        fontSize: 9,
        fontFamily: 'Montserrat',
        fontWeight: 'bold',
        textAlign: 'right',
        color: '#000000',
    },
    totalValueCell: {
        width: '20%',
        padding: 7,
        backgroundColor: '#e9f4d9',
        borderBottomWidth: 1,
        borderColor: '#72bf44',
        borderStyle: 'solid',
        fontSize: 9,
        fontFamily: 'Montserrat',
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000000',
    },

    // ── Terms ─────────────────────────────────────────────────────────────────
    pageHeader: {
        fontSize: 15,
        fontFamily: 'Montserrat',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
        color: '#000000',
    },
    section: {
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 9.5,
        fontFamily: 'Montserrat',
        fontWeight: 'bold',
        marginBottom: 2,
        color: '#000000',
    },
    bodyText: {
        fontSize: 9,
        lineHeight: 1.3,
        color: '#000000',
        marginBottom: 2,
    },
    bullet: {
        fontSize: 9,
        lineHeight: 1.3,
        marginLeft: 14,
        marginBottom: 3,
        color: '#000000',
    },
    bulletTitle: {
        fontWeight: 'bold',
        color: '#000000',
    },
    circleBullet: {
        fontSize: 9,
        lineHeight: 1.3,
        marginLeft: 28,
        marginBottom: 2,
        color: '#000000',
    },
    numbered: {
        fontSize: 9,
        lineHeight: 1.3,
        marginLeft: 18,
        marginBottom: 2,
        color: '#000000',
    },

    // ── Signatures ────────────────────────────────────────────────────────────
    sigContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 45,
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
        fontFamily: 'Montserrat',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 14,
        color: '#000000',
    },
    sigFieldRow: {
        flexDirection: 'row',
        marginBottom: 7,
        alignItems: 'flex-end',
    },
    sigFieldLabel: {
        width: 40,
        fontSize: 10,
        color: '#000000',
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

// Fixed display order — categories always appear in this sequence regardless of item order
const CATEGORY_ORDER = [
    'MAIN EQUIPMENTS',
    'FABRICATED ITEMS',
    'BREAKERS & SAFETY DEVICES',
    'CABLES & ACCESSORIES',
    'SERVICES',
    'OTHER',
];

function getCategory(itemType: string): string {
    const lower = itemType.toLowerCase().replace(/_/g, ' ');
    for (const g of GROUPS) {
        if (g.keywords.some(k => lower.includes(k))) return g.label;
    }
    return 'OTHER';
}

function formatText(text: string | null | undefined): string {
    if (!text) return '-';
    return text
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
}

// ─── Background components ────────────────────────────────────────────────────
// `fixed` on the View prevents @react-pdf from creating phantom blank pages.

function CoverBg() {
    return (
        <View style={[styles.bgCoverView, { zIndex: -1 }]} fixed>
            <Image src={`${window.location.origin}/assets/pdf/background/qutationformat 1 1.png`} style={styles.bgImage} />
        </View>
    );
}

function PageBg({ bgImage }: { pageNum?: number; bgImage: string }) {
    return (
        <View style={[styles.bgPageView, { zIndex: -1 }]} fixed>
            <Image src={`${window.location.origin}/assets/pdf/background/${bgImage}`} style={styles.bgImage} />
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
    const systemCapacity = quote.systemSize != null
        ? `${quote.systemSize} kW`
        : (totalW > 0 ? (totalW / 1000).toFixed(1) + ' kW' : 'XXX kW');

    // Group items and sort by fixed category order
    const groupMap = new Map<string, typeof quote.items>();
    for (const item of (quote.items ?? [])) {
        const cat = getCategory(item.itemType);
        if (!groupMap.has(cat)) groupMap.set(cat, []);
        groupMap.get(cat)!.push(item);
    }
    const grouped = CATEGORY_ORDER
        .filter(cat => groupMap.has(cat))
        .map(cat => ({ category: cat, items: groupMap.get(cat)! }));

    const today = new Date().toLocaleDateString('en-GB');

    return (
        <Document>

            {/* ═══════════════════════════════════════════════ PAGE 1 — COVER */}
            <Page size="A4" style={styles.page}>
                <CoverBg />
                <View style={styles.coverWrapper}>
                    <Text style={styles.coverSubtitle}>{`${systemCapacity} HYBRID`.toUpperCase()}</Text>
                    <Text style={styles.coverSubtitle}>SOLAR SOLUTION</Text>
                </View>
            </Page>

            {/* ═════════════════════════════════════ PAGE 2 — COVER LETTER */}
            <Page size="A4" style={styles.page}>
                <PageBg pageNum={1} bgImage="qutationformat back 1.png" />
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
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>System Size:</Text>
                            <Text style={styles.infoValue}>{systemCapacity}</Text>
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
                        renewable resources. TFP's Solar System ({systemCapacity} Package) enables you to avail net metering
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
                <PageBg pageNum={2} bgImage="qutationformat back 2.png" />
                <View style={[styles.contentArea, { paddingTop: 110 }]}>
                    <Text style={styles.tableTitle}>QUOTATION</Text>
                    <View style={styles.table}>
                        <View style={styles.tableRow}>
                            <Text style={[styles.thCell, { width: '20%' }]}>DESCRIPTION</Text>
                            <Text style={[styles.thCell, { width: '25%' }]}>ITEMS DETAIL</Text>
                            <Text style={[styles.thCell, { width: '30%' }]}>SPECIFICATION</Text>
                            <Text style={[styles.thCell, { width: '25%', borderRightWidth: 0 }]}>QUANTITY</Text>
                        </View>
                        {grouped.map((group, gi) => (
                            <View key={gi}>
                                <View style={styles.tableRow}>
                                    <Text style={styles.sectionCell}>{group.category}</Text>
                                </View>
                                {group.items!.map((item, ii) => (
                                    <View style={styles.tableRow} key={ii}>
                                        <Text style={[styles.tdCell, { width: '20%' }]}>
                                            {formatText(item.itemType)}
                                        </Text>
                                        <Text style={[styles.tdCell, { width: '25%' }]}>
                                            {formatText(item.itemName)}
                                        </Text>
                                        <Text style={[styles.tdCell, { width: '30%' }]}>
                                            {formatText(item.itemDescription)}
                                        </Text>
                                        <Text style={[styles.tdCell, { width: '25%', borderRightWidth: 0 }]}>
                                            {item.quantity}
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

            {/* ══════════════════════════ PAGE 4 — TERMS & CONDITIONS */}
            <Page size="A4" style={styles.page}>
                <PageBg pageNum={3} bgImage="qutationformat back 3.png" />
                <View style={[styles.contentArea, { paddingTop: 110 }]}>
                    <View style={{ marginBottom: 15 }}>
                        <Text style={[styles.pageHeader, { fontWeight: 'bold' }]}>TERMS &amp; CONDITIONS</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.bullet}>
                            <Text style={styles.bulletTitle}>{'\u2022'} Price Validity: </Text>
                            Price quoted is valid for 10 days from the date of quotation ({today}) or the date of confirmation/acceptance of order by customer, whichever is the earlier.
                        </Text>

                        <Text style={styles.bullet}>
                            <Text style={styles.bulletTitle}>{'\u2022'} Warranty: </Text>
                            10 Years Inverter &amp; Battery Warranty.
                        </Text>
                        <View style={{ marginLeft: 30 }}>
                            <Text style={styles.bullet}>{'-'} 12 years Solar Panel manufacturing Warranty.</Text>
                            <Text style={styles.bullet}>{'-'} 25 years Solar Panel performance Warranty.</Text>
                        </View>

                        <Text style={styles.bullet}>
                            <Text style={styles.bulletTitle}>{'\u2022'} Operation &amp; Maintenance: </Text>
                            One (1) year free-of-cost O&amp;M services as per prevailing company policy. Thereafter, Customer will be charged for O&amp;M subject to contract.
                        </Text>

                        <Text style={styles.bullet}>
                            <Text style={styles.bulletTitle}>{'\u2022'} Cleaning Services: </Text>
                            Three (3) month free-of-cost Solar Panel cleaning Service as per prevailing company policy. Thereafter, Customer will be charged for cleaning service subject to contract.
                        </Text>

                        <Text style={styles.bullet}>
                            <Text style={styles.bulletTitle}>{'\u2022'} Payment Option: </Text>
                        </Text>
                        <View style={{ marginLeft: 30 }}>
                            <Text style={styles.bullet}>{'-'} Delivery Timeline: Option 1: Within 15 days from date of confirmation of order</Text>
                            <Text style={styles.bullet}>{'-'} Payment Terms: 60% advance payment of Indicative Price</Text>
                            <View style={{ marginLeft: 45 }}>
                                <Text style={styles.bullet}>{'\u2022'} 30% On Day Of Material Delivery</Text>
                                <Text style={styles.bullet}>{'\u2022'} 10% After Installation</Text>
                            </View>
                        </View>

                        <Text style={styles.bullet}>
                            <Text style={styles.bulletTitle}>{'\u2022'} Net Metering: </Text>
                            The Future Power will assist Customer in procuring Net Metering. The obligation to procure required approvals rests with the Customer. In no circumstances shall The Future Power be held liable on any account if the said approval is not granted by NEPRA. The Future Power will assist Customer to prepare the required documentation for Net-Metering. Other Customer responsibilities for Net Metering include:
                        </Text>
                        <View style={{ marginLeft: 30 }}>
                            <Text style={styles.bullet}>{'-'} DC/AC Earthing</Text>
                            <Text style={styles.bullet}>{'-'} Meter Name change</Text>
                            <Text style={styles.bullet}>{'-'} Sanction load change</Text>
                            <Text style={styles.bullet}>{'-'} Net-Metering demand notice payment</Text>
                        </View>

                        <Text style={[styles.bodyText, { marginTop: 8, fontSize: 8.5, fontStyle: 'italic', textAlign: 'justify' }]}>
                            Note: Fee for facilitation services rendered in Net-Metering will be charged separately at per actual. It will be applicable as per the laws of NEPRA and local DISCO. This is an additional service for customer support. Timeline for Net-Metering to be operational depends on the NEPRA/DISCO approvals.
                        </Text>
                    </View>

                    {/* Scope of Work */}
                    <View style={[styles.section, { marginTop: 20 }]}>
                        <Text style={[styles.sectionTitle, { fontSize: 10 }]}>Scope of Work (Not Included):</Text>
                        <Text style={[styles.bodyText, { marginBottom: 10 }]}>Price does not include:</Text>
                        <View style={{ marginLeft: 15 }}>
                            <Text style={styles.numbered}>i.    Cost of any civil works,</Text>
                            <Text style={styles.numbered}>ii.   Extra cable cost for length of cable beyond what is specified in Standard Scope of Work.</Text>
                            <Text style={styles.numbered}>iii.  Interconnection between one distribution box to another distribution box and switched works and costs;</Text>
                            <Text style={styles.numbered}>iv. Customized solutions, v. Special/Shed Type Structure, vi. Out of City system delivery to site</Text>
                            <Text style={styles.numbered}>vii. Meter name change, viii. Meter sanctioned load change and I&amp;C required other than the above-mentioned scope of work shall be charged as per actual.</Text>
                        </View>
                    </View>

                </View>
            </Page>

            {/* ══════════════════════════ PAGE 5 — ACKNOWLEDGEMENTS */}
            <Page size="A4" style={styles.page}>
                <PageBg pageNum={4} bgImage="qutationformat back 4.png" />
                <View style={[styles.contentArea, { paddingTop: 110 }]}>
                    <Text style={[styles.tableTitle, { fontSize: 20, marginBottom: 50 }]}>Acknowledgements</Text>

                    <Text style={[styles.paragraph, { fontSize: 10, lineHeight: 1.6, marginBottom: 50, textAlign: 'justify' }]}>
                        I acknowledge and represent that I have read the terms and Conditions of this proposal and I fully
                        understand what is stated Herein. I expressly agree to all the terms and conditions set out Herein and to
                        adhere to all payment's obligations and other Ancillary obligations. In signing this proposal, I am not
                        relying on Any other representation made by the company to me.
                    </Text>

                    <View style={[styles.sigContainer, { marginTop: 40 }]}>
                        <View style={styles.sigBlock}>
                            <View style={styles.sigLine} />
                            <Text style={styles.sigLabel}>Customer Sign</Text>
                            <View style={{ marginTop: 20 }}>
                                {(['Name:', 'Date:', 'CNIC:'] as const).map((lbl) => (
                                    <View style={styles.sigFieldRow} key={lbl}>
                                        <Text style={styles.sigFieldLabel}>{lbl}</Text>
                                        <View style={styles.sigFieldLine} />
                                    </View>
                                ))}
                            </View>
                        </View>
                        <View style={styles.sigBlock}>
                            <View style={styles.sigLine} />
                            <Text style={styles.sigLabel}>Sales Representative Sign</Text>
                            <View style={{ marginTop: 20 }}>
                                {(['Name:', 'Date:'] as const).map((lbl) => (
                                    <View style={styles.sigFieldRow} key={lbl}>
                                        <Text style={styles.sigFieldLabel}>{lbl}</Text>
                                        <View style={styles.sigFieldLine} />
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>
            </Page>

        </Document>
    );
}
