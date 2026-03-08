import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
    Font,
    Svg,
    Polygon
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
        paddingTop: 190,
        paddingHorizontal: 40,
    },
    coverTitle: {
        fontSize: 32,
        fontFamily: 'Montserrat',
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#ffffff',
    },
    coverSubtitle: {
        fontSize: 26,
        fontFamily: 'Montserrat',
        fontWeight: 'bold',
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

    // ── Checklist ─────────────────────────────────────────────────────────────
    checkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    checkBox: {
        width: 12,
        height: 12,
        borderWidth: 1,
        borderColor: '#374151',
        marginRight: 10,
        backgroundColor: '#ffffff',
    },
    checkLabel: {
        fontSize: 9,
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
    // Page Numbering
    triangleFooter: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 80,
        height: 80,
    },
    pageNumberText: {
        position: 'absolute',
        bottom: 12,
        right: 18,
        fontSize: 16,
        fontFamily: 'Montserrat',
        fontWeight: 'bold',
        color: '#ffffff',
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
        <View style={[styles.bgCoverView, { zIndex: -1 }]} fixed>
            <Image src={`${window.location.origin}/assets/pdf/page-bg.png`} style={styles.bgImage} />
        </View>
    );
}

function PageBg({ pageNum }: { pageNum?: number }) {
    return (
        <View style={[styles.bgPageView, { zIndex: -1 }]} fixed>
            {/* Using page3-bg.png because it has the logo and the newer A-19 address */}
            <Image src={`${window.location.origin}/assets/pdf/page3-bg.png`} style={styles.bgImage} />

            {/* Cover the hardcoded "3" in the corner of page3-bg.png */}
            <View style={{
                position: 'absolute',
                bottom: 8,
                right: 12,
                width: 30,
                height: 30,
                backgroundColor: '#ffffff'
            }} />

            {pageNum && (
                <View style={styles.triangleFooter}>
                    <Svg width="80" height="80">
                        <Polygon points="80,0 80,80 0,80" fill="#72bf44" />
                    </Svg>
                    <Text style={styles.pageNumberText}>{pageNum}</Text>
                </View>
            )}
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
                    <Text style={styles.coverSubtitle}>{systemCapacity} Hybrid SYSTEM</Text>
                    <Text style={styles.coverSubtext}>SOLAR POWER GENERATION SYSTEM</Text>
                </View>
            </Page>

            {/* ═════════════════════════════════════ PAGE 2 — COVER LETTER */}
            <Page size="A4" style={styles.page}>
                <PageBg pageNum={1} />
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
                <PageBg pageNum={2} />
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

            {/* ══════════════════════════ PAGE 4 — TERMS & CONDITIONS (PART 1) */}
            <Page size="A4" style={styles.page}>
                <PageBg pageNum={3} />
                <View style={[styles.contentArea, { paddingTop: 110 }]}>
                    <View style={{ marginBottom: 15 }}>
                        <Text style={[styles.pageHeader, { fontWeight: 'bold' }]}>TERMS &amp; CONDITIONS</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.bullet}>
                            <Text style={styles.bulletTitle}>{'\u2022'} Indicative Price: PKR {Number(quote.finalAmount).toLocaleString()}/-, </Text>
                            which is based on USD-PKR exchange rate of [280.07] PKR = 1 USD as at the date of this quotation. The impact of any depreciation in PKR with respect to the USD-PKR exchange rate forms part of the total product price and will be charged to the customer as set out below.
                        </Text>

                        <Text style={styles.bullet}>
                            <Text style={styles.bulletTitle}>{'\u2022'} Price Validity: </Text>
                            Price quoted is valid for 10 days from the date of quotation ({today}) or the date of confirmation/acceptance of order by customer, whichever is the earlier.
                        </Text>

                        <Text style={styles.bullet}>
                            <Text style={styles.bulletTitle}>{'\u2022'} Other Terms: </Text>
                            All payments to be made by crossed cheque in the name of The Future Power. Order by Customer will be deemed confirmed/accepted upon receipt of advance payment as per Payment Option selected by the Customer. Final Price of System will be calculated on USD-PKR exchange rate as at the date of installation or date of final payment by the customer. Balance, if any, due on account of exchange rate variation shall be paid by Customer upon invoice raised by The Future Power before installation of System at site.
                        </Text>

                        <Text style={styles.bullet}>
                            <Text style={styles.bulletTitle}>{'\u2022'} Warranty: </Text>
                            10 Years Inverter &amp; Battery Warranty.
                        </Text>
                        <View style={{ marginLeft: 30 }}>
                            <Text style={styles.bullet}>{'\u25CB'} 12 years Solar Panel manufacturing Warranty.</Text>
                            <Text style={styles.bullet}>{'\u25CB'} 25 years Solar Panel performance Warranty.</Text>
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
                            <Text style={styles.bullet}>{'\u25CB'} Delivery Timeline: Option 1: Within 15 days from date of confirmation of order</Text>
                            <Text style={styles.bullet}>{'\u25CB'} Payment Terms: 60% advance payment of Indicative Price</Text>
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
                            <Text style={styles.bullet}>{'\u25CB'} DC/AC Earthing</Text>
                            <Text style={styles.bullet}>{'\u25CB'} Meter Name change</Text>
                            <Text style={styles.bullet}>{'\u25CB'} Sanction load change</Text>
                            <Text style={styles.bullet}>{'\u25CB'} Net-Metering demand notice payment</Text>
                        </View>

                        <Text style={[styles.bodyText, { marginTop: 8, fontSize: 8.5, fontStyle: 'italic', textAlign: 'justify' }]}>
                            Note: Fee for facilitation services rendered in Net-Metering will be charged separately at per actual. It will be applicable as per the laws of NEPRA and local DISCO. This is an additional service for customer support. Timeline for Net-Metering to be operational depends on the NEPRA/DISCO approvals.
                        </Text>
                    </View>
                </View>
            </Page>

            {/* ══════════════════════════ PAGE 5 — SCOPE & CHECKLIST */}
            <Page size="A4" style={styles.page}>
                <PageBg pageNum={4} />
                <View style={[styles.contentArea, { paddingTop: 110 }]}>
                    <Text style={[styles.pageHeader, { fontWeight: 'bold' }]}>TERMS &amp; CONDITIONS</Text>

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

                    {/* Customer Check List */}
                    <View style={[styles.section, { marginTop: 40 }]}>
                        <Text style={[styles.tableTitle, { textAlign: 'center', marginBottom: 5 }]}>
                            CUSTOMER CHECK LIST
                        </Text>
                        <Text style={[styles.bodyText, { textAlign: 'center', marginBottom: 20, fontSize: 8 }]}>
                            (Tick the boxes if you have the following)
                        </Text>

                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 15, justifyContent: 'space-between', paddingHorizontal: 40 }}>
                            {[
                                'Proposal',
                                'CNIC Copy / NTN Certificate (In case of business)',
                                'Last Month Bill Copy',
                                'Advance Payment Cheque',
                                'PV Layout Design',
                                'Sanction Load As Per System',
                                'Meter Name as Per Requirement',
                            ].map((label, key) => (
                                <View style={[styles.checkRow, { width: '45%' }]} key={key}>
                                    <View style={styles.checkBox} />
                                    <Text style={styles.checkLabel}>{label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </Page>

            {/* ══════════════════════════ PAGE 6 — ACKNOWLEDGEMENTS */}
            <Page size="A4" style={styles.page}>
                <PageBg pageNum={5} />
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
