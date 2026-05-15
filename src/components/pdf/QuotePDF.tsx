import {
    Document,
    Page,
    View,
    Text,
    Image,
    StyleSheet,
    Font,
    Svg,
    Circle,
    Path,
} from '@react-pdf/renderer';
import type { Quote, QuoteItem } from '../../types';

// ─── Asset paths ──────────────────────────────────────────────────────────────
const ORIGIN = typeof window !== 'undefined' ? window.location.origin : '';
const ASSET  = `${ORIGIN}/assets/pdf/daytrack`;
const PAGES  = `${ASSET}/pages`;

Font.register({
    family: 'Montserrat',
    fonts: [
        { src: `${ORIGIN}/assets/pdf/fonts/Montserrat-Regular.ttf`,   fontWeight: 'normal' },
        { src: `${ORIGIN}/assets/pdf/fonts/Montserrat-Italic.ttf`,    fontWeight: 'normal', fontStyle: 'italic' },
        { src: `${ORIGIN}/assets/pdf/fonts/Montserrat-Bold.ttf`,       fontWeight: 'bold' },
        { src: `${ORIGIN}/assets/pdf/fonts/Montserrat-ExtraBold.ttf`,  fontWeight: 800 },
    ],
});

// ─── Palette ──────────────────────────────────────────────────────────────────
const BLU  = '#1b5082';
const GRN  = '#2d9e5f';
const ORG  = '#e8921a';
const TXT  = '#333333';
const ICON = '#1a7fa8'; // teal-blue of the footer circles

// A4 in points
const PW = 595;
const PH = 842;

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    // Full-page background — explicit A4 pts so it never pushes content to next page
    pageBg: {
        position: 'absolute',
        top: 0, left: 0,
        width: PW, height: PH,
    },

    // ── Cover page ──────────────────────────────────────────────────────────
    coverLogo: {
        width: 205,
    },
    coverTitle: {
        fontFamily: 'Montserrat',
        fontWeight: 'bold',
        fontSize: 26,
        color: BLU,
        textAlign: 'center',
        lineHeight: 1.25,
    },
    coverSubtitle: {
        fontFamily: 'Montserrat',
        fontWeight: 'bold',
        fontSize: 14,
        color: TXT,
        textAlign: 'center',
    },
    coverTable: {
        width: 312,
    },
    coverRowTop: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#888888',
    },
    coverRowBot: {
        flexDirection: 'row',
    },
    coverCellLabel: {
        width: 135,
        backgroundColor: GRN,
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    coverCellLabelTxt: {
        fontFamily: 'Montserrat',
        fontWeight: 'bold',
        fontSize: 9.5,
        color: '#ffffff',
    },
    coverCellValue: {
        flex: 1,
        backgroundColor: ORG,
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    coverCellValueTxt: {
        fontFamily: 'Montserrat',
        fontWeight: 'bold',
        fontSize: 9.5,
        color: '#1a1a1a',
    },
    coverAddressTxt: {
        fontFamily: 'Montserrat',
        fontSize: 7.5,
        color: '#555555',
        textAlign: 'center',
        lineHeight: 1.5,
    },

    // ── Financial proposal page ─────────────────────────────────────────────
    proposalLogo: {
        width: 110,
    },
    proposalTitle: {
        fontFamily: 'Montserrat',
        fontWeight: 'bold',
        fontSize: 13,
        color: GRN,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 10,
        marginHorizontal: 30,
    },

    // Table
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: BLU,
    },
    thCell: {
        fontFamily: 'Montserrat',
        fontWeight: 'bold',
        fontSize: 8,
        color: '#ffffff',
        textAlign: 'center',
        paddingVertical: 6,
        paddingHorizontal: 4,
    },
    tableRow: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderBottomWidth: 0.5,
        borderBottomColor: '#dddddd',
    },
    tableRowAlt: {
        flexDirection: 'row',
        backgroundColor: '#ddeef8',
        borderBottomWidth: 0.5,
        borderBottomColor: '#dddddd',
    },
    tdNum: {
        fontFamily: 'Montserrat',
        fontSize: 8,
        color: TXT,
        textAlign: 'center',
        paddingVertical: 5,
        paddingHorizontal: 3,
    },
    tdItem: {
        fontFamily: 'Montserrat',
        fontSize: 8,
        color: TXT,
        textAlign: 'center',
        paddingVertical: 5,
        paddingHorizontal: 4,
    },
    tdSpec: {
        fontFamily: 'Montserrat',
        fontSize: 7.5,
        color: TXT,
        textAlign: 'left',
        paddingVertical: 5,
        paddingHorizontal: 5,
    },
    tdUnit: {
        fontFamily: 'Montserrat',
        fontSize: 8,
        color: TXT,
        textAlign: 'center',
        paddingVertical: 5,
        paddingHorizontal: 3,
    },
    tdQty: {
        fontFamily: 'Montserrat',
        fontSize: 8,
        color: TXT,
        textAlign: 'center',
        paddingVertical: 5,
        paddingHorizontal: 3,
    },

    // Pricing summary
    summaryWrap: {
        alignSelf: 'flex-end',
        width: 270,
        marginTop: 12,
        marginRight: 30,
        borderWidth: 1,
        borderColor: '#cccccc',
    },
    summaryRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderBottomColor: '#cccccc',
    },
    summaryLabel: {
        flex: 1,
        fontFamily: 'Montserrat',
        fontSize: 9,
        color: TXT,
        padding: 6,
    },
    summaryValue: {
        width: 115,
        fontFamily: 'Montserrat',
        fontSize: 9,
        color: TXT,
        textAlign: 'right',
        padding: 6,
    },
    summaryTotalRow: {
        flexDirection: 'row',
        backgroundColor: '#fef5e0',
    },
    summaryTotalLabel: {
        flex: 1,
        fontFamily: 'Montserrat',
        fontWeight: 'bold',
        fontSize: 9,
        color: BLU,
        padding: 6,
    },
    summaryTotalValue: {
        width: 115,
        fontFamily: 'Montserrat',
        fontWeight: 'bold',
        fontSize: 9,
        color: BLU,
        textAlign: 'right',
        padding: 6,
    },
});

// ─── Footer component (matches all other pages) ───────────────────────────────
// SVG icon paths for footer circles
const GLOBE_PATH  = 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z';
const PHONE_PATH  = 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z';
const EMAIL_PATH  = 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z';

function FooterItem({ iconPath, label }: { iconPath: string; label: string }) {
    return (
        <View style={{ alignItems: 'center', flexDirection: 'column' }}>
            <Svg width={22} height={22} viewBox="0 0 24 24">
                <Circle cx={12} cy={12} r={12} fill={ICON} />
                <Path d={iconPath} fill="#ffffff" transform="translate(3.6,3.6) scale(0.7)" />
            </Svg>
            <Text style={{
                fontFamily: 'Montserrat',
                fontSize: 6.5,
                color: '#444444',
                textAlign: 'center',
                marginTop: 3,
            }}>{label}</Text>
        </View>
    );
}

function ProposalFooter() {
    return (
        <View style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            paddingBottom: 10,
            paddingTop: 6,
        }} fixed>
            <FooterItem iconPath={GLOBE_PATH}  label="www.daytracksolar.com" />
            <FooterItem iconPath={PHONE_PATH}  label={'+92 327 8277066  |  +92 327 8277055'} />
            <FooterItem iconPath={EMAIL_PATH}  label="info@daytracksolar.com" />
        </View>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getRowLabel(item: QuoteItem): string {
    switch (item.itemType) {
        case 'solar_panel':  return 'Solar Panel';
        case 'inverter':     return 'Solar Inverter';
        case 'battery':      return 'Battery';
        case 'structure':    return 'Structure';
        case 'service':      return 'Services';
        case 'electrical':   return 'Electrical';
        case 'misc_item':    return item.itemName || 'Misc Item';
        default:             return item.itemName || item.itemType;
    }
}

function buildSpec(item: QuoteItem): string {
    const parts: string[] = [];
    if (item.brandName)       parts.push(`Make: ${item.brandName}`);
    if (item.itemName && item.itemType !== 'misc_item') parts.push(item.itemName);
    if (item.itemDescription) parts.push(item.itemDescription);
    return parts.filter(Boolean).join('\n') || '-';
}

function getUnit(itemType: string): string {
    switch (itemType) {
        case 'solar_panel':
        case 'inverter':
        case 'battery':
            return 'Nos';
        default:
            return 'JOB';
    }
}

const ITEM_ORDER: Record<string, number> = {
    solar_panel: 1, inverter: 2, battery: 3,
    structure: 4, electrical: 5, misc_item: 6, service: 7,
};

function sortItems(items: QuoteItem[]): QuoteItem[] {
    return [...items].sort(
        (a, b) => (ITEM_ORDER[a.itemType] ?? 99) - (ITEM_ORDER[b.itemType] ?? 99)
    );
}

function generateRefNo(quote: Quote): string {
    const d  = new Date(quote.createdAt);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    const sx = quote.id.replace(/[^a-zA-Z0-9]/g, '').slice(-2).toUpperCase();
    return `DTS-${dd}${mm}${yy}-${sx}`;
}

function fmtCurrency(n: number): string {
    return Number(n).toLocaleString('en-PK') + '/-';
}

// ─── Component ────────────────────────────────────────────────────────────────
interface QuotePDFProps { quote: Quote }

export function QuotePDF({ quote }: QuotePDFProps) {
    const items       = quote.items ?? [];
    const sortedItems = sortItems(items);

    const systemKw = quote.systemSize != null
        ? `${Number(quote.systemSize).toFixed(1)}`
        : (() => {
            const panels = items.filter(i => i.itemType === 'solar_panel');
            const totalW = panels.reduce((sum, i) => {
                const m = `${i.itemName ?? ''} ${i.itemDescription ?? ''}`.match(/(\d{3,4})\s*[wW]/);
                return sum + i.quantity * (m ? parseInt(m[1], 10) : 585);
            }, 0);
            return totalW > 0 ? (totalW / 1000).toFixed(1) : '0.0';
        })();

    const preparedBy = (quote as any).salesRepName ?? quote.createdBy?.fullName ?? 'DayTrack Solar Solutions';
    const refNo      = generateRefNo(quote);

    const bgUrl   = `${ASSET}/daytrack-bg.jpg`;   // resized to A4 proportions
    const logoUrl = `${ASSET}/daytrack-logo.png`;

    // Column widths for the financial proposal table
    const W = { no: 32, item: 125, unit: 62, qty: 48 };

    const storedProfit = Number(quote.profitAmount ?? 0);
    const profitAmt    = storedProfit > 0 ? storedProfit : Math.round(Number(quote.finalAmount) * 0.10);
    const netAmount    = Number(quote.totalAmount) + profitAmt;
    const totalDiscounted = Number(quote.finalAmount) + profitAmt;

    return (
        <Document>

            {/* ══════════════════════════════════════════ PAGE 1 — COVER
                  Mirrors Page 4's pattern exactly: absolute background + normal-flow
                  content with margins. This is the only pattern react-pdf v4 renders
                  correctly without generating a ghost empty page. */}
            <Page size="A4" style={{ fontFamily: 'Montserrat' }}>

                {/* Background — same as Page 4: absolute + fixed anchors it to the page */}
                <Image src={bgUrl} style={s.pageBg} fixed />

                {/* Logo — normal flow, centred, margin pushes it to y≈65 */}
                <View style={{ alignSelf: 'center', marginTop: 65 }}>
                    <Image src={logoUrl} style={{ width: 205, height: 114 }} />
                </View>

                {/* Title — normal flow, logo bottom=179 → marginTop=50 → top≈229 */}
                <View style={{ marginTop: 50, marginHorizontal: 48 }}>
                    <Text style={s.coverTitle}>{'RESIDENTIAL PROJECT\nPROPOSAL'}</Text>
                </View>

                {/* Subtitle — title height≈65 → bottom≈294 → marginTop=10 → top≈304 */}
                <View style={{ marginTop: 10, marginHorizontal: 48 }}>
                    <Text style={s.coverSubtitle}>{systemKw} KW HYBRID Quotation</Text>
                </View>

                {/* Info table — subtitle height≈17 → bottom≈321 → marginTop=27 → top≈348 */}
                <View style={{ marginTop: 27, alignSelf: 'center', width: 312 }}>
                    <View style={s.coverRowTop}>
                        <View style={s.coverCellLabel}>
                            <Text style={s.coverCellLabelTxt}>Prepared By:</Text>
                        </View>
                        <View style={s.coverCellValue}>
                            <Text style={s.coverCellValueTxt}>{preparedBy}</Text>
                        </View>
                    </View>
                    <View style={s.coverRowTop}>
                        <View style={s.coverCellLabel}>
                            <Text style={s.coverCellLabelTxt}>Reference Number:</Text>
                        </View>
                        <View style={s.coverCellValue}>
                            <Text style={s.coverCellValueTxt}>{refNo}</Text>
                        </View>
                    </View>
                    <View style={s.coverRowTop}>
                        <View style={s.coverCellLabel}>
                            <Text style={s.coverCellLabelTxt}>Customer Name:</Text>
                        </View>
                        <View style={s.coverCellValue}>
                            <Text style={s.coverCellValueTxt}>{quote.customerName}</Text>
                        </View>
                    </View>
                    <View style={s.coverRowBot}>
                        <View style={s.coverCellLabel}>
                            <Text style={s.coverCellLabelTxt}>Customer Address:</Text>
                        </View>
                        <View style={s.coverCellValue}>
                            <Text style={s.coverCellValueTxt}>{quote.customerAddress || '—'}</Text>
                        </View>
                    </View>
                </View>

                {/* Company address — absolute at bottom, same as ProposalFooter in Page 4 */}
                <View style={{ position: 'absolute', bottom: 22, left: 0, right: 0, alignItems: 'center' }}>
                    <Text style={s.coverAddressTxt}>
                        {'Address: Office No. M3, Mezzanine Floor, Sadaf Garden,\nBlock-14, Near Kababjees, Munawar Chowrangi, Gulistan-e-Jauhar, Karachi'}
                    </Text>
                </View>

            </Page>

            {/* ══════════════════════════════════════ PAGE 2 — WHO WE ARE */}
            <Page size="A4">
                <Image src={`${PAGES}/page-02.png`} style={s.pageBg} />
            </Page>

            {/* ══════════════════════ PAGE 3 — SYSTEM DESIGN / INSTALLATION */}
            <Page size="A4">
                <Image src={`${PAGES}/page-03.png`} style={s.pageBg} />
            </Page>

            {/* ═══════════════════════════════ PAGE 4 — FINANCIAL PROPOSAL
                  paddingBottom leaves room for the fixed footer (≈45 pts).
                  If the table overflows, the `fixed` bg+footer repeat automatically. */}
            <Page size="A4" style={{ fontFamily: 'Montserrat', paddingBottom: 48 }}>
                {/* Background repeats on every continuation page */}
                <Image src={bgUrl} style={s.pageBg} fixed />

                {/* Header — logo row, then title below (no overlap) */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    paddingRight: 30,
                    paddingTop: 10,
                }}>
                    <Image src={logoUrl} style={s.proposalLogo} />
                </View>

                <Text style={s.proposalTitle}>
                    {'FINANCIAL PROPOSAL FOR ' + systemKw + ' KW HYBRID SYSTEM'}
                </Text>

                {/* Items table */}
                <View style={{ marginHorizontal: 30 }}>
                    <View style={s.tableHeaderRow}>
                        <Text style={[s.thCell, { width: W.no }]}>S. No.</Text>
                        <Text style={[s.thCell, { width: W.item }]}>Item</Text>
                        <Text style={[s.thCell, { flex: 1 }]}>Specification</Text>
                        <Text style={[s.thCell, { width: W.unit }]}>Unit</Text>
                        <Text style={[s.thCell, { width: W.qty }]}>Qty</Text>
                    </View>

                    {sortedItems.map((item, idx) => (
                        <View
                            key={item.id ?? idx}
                            style={idx % 2 === 0 ? s.tableRow : s.tableRowAlt}
                        >
                            <Text style={[s.tdNum,  { width: W.no }]}>{idx + 1}</Text>
                            <Text style={[s.tdItem, { width: W.item }]}>{getRowLabel(item)}</Text>
                            <Text style={[s.tdSpec, { flex: 1 }]}>{buildSpec(item)}</Text>
                            <Text style={[s.tdUnit, { width: W.unit }]}>{getUnit(item.itemType)}</Text>
                            <Text style={[s.tdQty,  { width: W.qty }]}>{item.quantity}</Text>
                        </View>
                    ))}
                </View>

                {/* Pricing summary */}
                <View style={s.summaryWrap}>
                    <View style={s.summaryRow}>
                        <Text style={s.summaryLabel}>Net Amount</Text>
                        <Text style={s.summaryValue}>{fmtCurrency(netAmount)}</Text>
                    </View>
                    <View style={s.summaryRow}>
                        <Text style={s.summaryLabel}>Total Discount</Text>
                        <Text style={s.summaryValue}>{fmtCurrency(quote.discountAmount)}</Text>
                    </View>
                    <View style={s.summaryTotalRow}>
                        <Text style={s.summaryTotalLabel}>Total Discounted Price</Text>
                        <Text style={s.summaryTotalValue}>{fmtCurrency(totalDiscounted)}</Text>
                    </View>
                </View>

                {/* Optional notes */}
                {quote.notes ? (
                    <View style={{ marginTop: 10, marginHorizontal: 30 }}>
                        <Text style={{ fontFamily: 'Montserrat', fontWeight: 'bold', fontSize: 7.5, color: TXT, marginBottom: 2 }}>NOTE:</Text>
                        <Text style={{ fontFamily: 'Montserrat', fontSize: 7.5, color: TXT, lineHeight: 1.4 }}>{quote.notes}</Text>
                    </View>
                ) : null}

                {/* Footer — same design as all other pages, repeats on continuation */}
                <ProposalFooter />
            </Page>

            {/* ══════════════════════════════ PAGES 5–9 — STATIC CONTENT
                  page-05 (alternative proposal template) is intentionally omitted.
                  We go straight to T&C and Declaration. */}

            {/* Page 5: Terms & Conditions Part 1 (Sections 1–6) */}
            <Page size="A4">
                <Image src={`${PAGES}/page-06.png`} style={s.pageBg} />
            </Page>

            {/* Page 6: Terms & Conditions Part 2 (Sections 7–11) */}
            <Page size="A4">
                <Image src={`${PAGES}/page-07.png`} style={s.pageBg} />
            </Page>

            {/* Page 7: Terms & Conditions Part 3 (Sections 12–13) */}
            <Page size="A4">
                <Image src={`${PAGES}/page-08.png`} style={s.pageBg} />
            </Page>

            {/* Page 8: Terms & Conditions Part 4 (Section 13 cont. + Scope) */}
            <Page size="A4">
                <Image src={`${PAGES}/page-09.png`} style={s.pageBg} />
            </Page>

            {/* Page 9: Customer Declaration + Acknowledgement */}
            <Page size="A4">
                <Image src={`${PAGES}/page-10.png`} style={s.pageBg} />
            </Page>

        </Document>
    );
}
