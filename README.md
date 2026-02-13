# Club Girl Golf — Inventory & Financial Model

An interactive dashboard that turns your Excel inventory model into a live, editable web app. Built for Club Girl Golf's operations team and investors.

No backend, no login, no database. Everything runs in your browser.

---

## Getting Started

### Option 1: Visit the live site
Go to **https://shivamkanodia19.github.io/clubgirlgolf/** — it works immediately.

### Option 2: Run it locally for development
```bash
git clone https://github.com/shivamkanodia19/clubgirlgolf.git
cd clubgirlgolf
npm install
npm start
```
This opens the dashboard at `http://localhost:8080` with **live reload** — any file you save automatically refreshes the browser.

---

## How to Use This App

### When You First Open It

The app automatically loads the Excel file (`ClubGirlGolf_INVESTOR_READY.xlsx`) and shows you the full dashboard. No upload needed.

You'll see:
- **6 KPI cards** at the top with high-level business metrics
- **3 panels** in the middle (Inventory Runway, Inventory Chart, Revenue Chart)
- **A margin trend chart** below that
- **4 expandable sections** you can click to open (SKU Assumptions, Demand Forecast, Inventory Model, Financial Summary)

Everything updates in real time as you make changes.

---

### The Header Bar

At the top right, you have four buttons:

| Button | What it does |
|--------|-------------|
| **+ Add SKU** | Opens a form to add a brand new product to the model |
| **Reset to Original** | Erases all your changes and reloads the original Excel data |
| **Download Excel** | Exports your current model (with all edits) as a new `.xlsx` file |
| **Upload File** | Load a different Excel file instead of the default one |

Below the logo, you'll see a small line showing whether your changes are saved locally (e.g., "Changes saved locally - 2/13/2025, 3:45 PM") or if you're looking at the original data.

---

### KPI Cards (Top Row)

These 6 cards give you an instant snapshot of the business:

| Card | What it shows |
|------|--------------|
| **Total Revenue** | Sum of all DTC + Wholesale revenue across all 12 months |
| **Gross Margin %** | Overall gross profit as a percentage of total revenue |
| **Total Units Sold** | Combined unit sales across all SKUs and channels for the year |
| **Inventory On Hand** | Total starting inventory across all SKUs right now |
| **SKUs Below Safety** | How many SKUs currently have inventory below their safety stock threshold (turns red if > 0) |
| **Cash in Inventory** | Dollar value of all inventory on hand (units x unit cost) |

These update instantly when you change any input.

---

### Inventory Runway (Left Panel)

This table shows how long your current stock will last for each SKU:

- **Stock** — Current inventory on hand
- **Daily** — Average units sold per day (annual demand / 365)
- **Days** — How many days until you run out at the current sell rate
- **Status** — Color-coded badge:
  - **OK** (green) — 120+ days of stock remaining
  - **SOON** (orange) — 60-120 days remaining
  - **URGENT** (red) — Less than 60 days remaining

**Click any row** to switch the Inventory Movement chart (center panel) to that SKU.

---

### Inventory Movement Chart (Center Panel)

A line chart showing the selected SKU's **ending inventory by month** (Jan through Dec). This creates the classic "sawtooth" pattern — inventory declines as you sell, then spikes when shipments arrive.

- **Pink line** = Ending inventory each month
- **Red dashed line** = Safety stock level (the minimum you want to keep on hand)

Use the **dropdown** in the top-right corner of this panel to switch between SKUs, or click a row in the Inventory Runway table.

---

### Revenue Breakdown (Right Panel)

A stacked bar chart showing monthly revenue split by channel:

- **Pink bars** = DTC (Direct to Consumer) revenue
- **Dark bars** = Wholesale revenue

This helps you see which months have wholesale orders coming in vs. DTC-only months.

---

### Gross Margin Trend

A line chart showing **gross margin %** for each month. The Y-axis auto-scales to the data range. Months with wholesale orders tend to have lower margins (wholesale prices are lower than DTC prices).

---

### SKU Assumptions (Expandable Section)

Click to expand. This is the **master data** for every product in your model.

Every cell with a pink/blush background is **editable**. You can change:

| Field | What it controls |
|-------|-----------------|
| **Product Name** | Display name used throughout the dashboard |
| **Unit Cost** | Your manufacturing/purchase cost per unit — drives COGS calculations |
| **DTC Price** | The price you sell at on your own website — drives DTC revenue |
| **Wholesale Price** | The price retailers pay — drives wholesale revenue |
| **Lead Time** | How many months it takes from placing an order to receiving it. This is critical — the reorder alert system looks this many months ahead |
| **Safety Stock** | The minimum inventory level you want to maintain. When projected future inventory drops below this, you get an alert |
| **Cur. Inventory** | Starting inventory for January (month 1). This is the seed number the entire inventory model builds from |
| **MOQ** | Minimum Order Quantity — the smallest amount your manufacturer will accept per order |

The **x** button on each row lets you **delete a SKU** from the model (you'll get a confirmation prompt).

---

### Demand Forecast (Expandable Section)

Click to expand. This shows **projected unit sales by SKU, by channel, by month**.

For each SKU you'll see:
- **DTC row** — Direct to consumer sales (editable, pink cells)
- **Company X row** — Wholesale orders from retailer X (editable)
- **Company Y row** — Wholesale orders from retailer Y (editable)
- **TOTAL row** — Auto-calculated sum (not editable, bold)

**To change a forecast:** Click any pink cell, type a new number, and press Tab or Enter. The entire model recalculates instantly — inventory levels, alerts, revenue, margins, everything.

**Example:** If you hear that Company X wants to increase their March order from 150 to 250 units of SKU001, just find that cell and change it. You'll immediately see how it impacts your inventory and when you need to reorder.

---

### Inventory Model (Expandable Section)

Click to expand. This is the core of the tool — it tracks inventory month by month for every SKU.

For each SKU, the rows are:

| Row | What it shows |
|-----|--------------|
| **Beginning Inv.** | Stock at the start of the month (January = your current inventory; other months = previous month's ending) |
| **Gross Sales** | Total units sold that month (DTC + all wholesale — pulled from Demand Forecast) |
| **Net Position** | Beginning inventory minus sales. If negative, you've sold more than you have |
| **Incoming Shipments** | **EDITABLE** — Units arriving from your manufacturer that month. This is where you simulate restock orders |
| **Ending Inventory** | What's left at month end: max(0, net position + incoming). Can never go below 0 |
| **Mo. of Supply** | How many months your ending inventory would last at the average future sell rate |
| **Order Alert** | The reorder warning system (see below) |
| **Order Qty** | Suggested order quantity if an alert is triggered |

**Color coding on Ending Inventory:**
- **Green** — Above safety stock, you're in good shape
- **Orange** — Below safety stock but not zero
- **Red** — Stockout (0 units). You're losing sales

**To simulate a restock:** Enter a number in any **Incoming Shipments** cell. For example, put 200 in SKU001's April shipment cell. You'll see April's ending inventory jump up, and downstream months improve. Alerts may clear.

---

### How the Reorder Alert System Works

This is the most important logic in the tool. It answers the question: **"Do I need to place an order right now?"**

The system looks **ahead** by each SKU's lead time. For example:

- SKU001 has a **3-month lead time**
- In **January**, the system looks at what inventory will be in **April** (3 months ahead)
- If April's projected ending inventory is **below safety stock** → **ORDER NOW!** (red)
- If April's projected ending inventory is **below 1.5x safety stock** → **ORDER SOON** (orange)
- Otherwise → no alert

**The Oct/Nov/Dec fix:** For months near the end of the year, looking 3 months ahead would go past December. The model extends projections 6 months beyond December using the average demand from Oct/Nov/Dec, so alerts in late months still work correctly.

**Order Qty Needed** tells you how much to order: enough to get back above safety stock plus cover the next month's demand, but never less than the MOQ.

---

### Financial Summary (Expandable Section)

Click to expand. Shows the money side of the model, calculated automatically from all your inputs.

**Revenue section:**
- DTC Revenue = DTC units x DTC price (per SKU, per month)
- Wholesale Revenue = Wholesale units x Wholesale price
- Total Revenue = DTC + Wholesale

**Cost of Goods Sold section:**
- Total Units Sold = All units across all channels
- COGS = Total units x Unit cost (per SKU)
- Gross Profit = Revenue - COGS
- Gross Margin % = Gross Profit / Revenue

**Cash Flow section:**
- Cash Inflow = Total revenue received
- Cash Outflow = Cost of incoming shipments (units received x unit cost)
- Net Cash Flow = Inflow - Outflow

The **Total** column on the right shows the annual sum (or weighted average for margin %).

---

### Saving and Loading Your Work

**Your changes auto-save.** Every time you edit a cell, add a SKU, or delete one, the app saves your current state to your browser's localStorage. If you close the tab and come back later, your edits are still there.

**Reset to Original** — Click this to wipe all saved changes and go back to the original Excel data. You'll get a confirmation prompt.

**Download Excel** — Exports your current model as a new `.xlsx` file with 4 tabs (Assumptions, Demand Forecast, Inventory Model, Financial Summary). You can open this in Excel, share it, or upload it again later.

**Upload File** — Load a different Excel file. This clears your saved edits and parses the new file.

---

### Common Scenarios

**"A retailer wants to double their spring order"**
1. Open Demand Forecast
2. Find the retailer's row for the relevant SKU
3. Update the March/April numbers
4. Check the Inventory Model — do you need to increase shipments?

**"Our manufacturer raised prices"**
1. Open SKU Assumptions
2. Update the Unit Cost for affected SKUs
3. Watch the Gross Margin % and COGS update across the financial summary

**"We're launching a new product"**
1. Click + Add SKU
2. Fill in the product details (cost, prices, lead time, etc.)
3. Open Demand Forecast and enter your sales projections
4. Open Inventory Model and add incoming shipments for your first batch

**"When do I need to reorder SKU003?"**
1. Look at the Inventory Model section for SKU003
2. Find the first month that shows ORDER NOW! or ORDER SOON
3. The Order Qty row tells you how many to order
4. Alternatively, check the Inventory Runway table for a quick days-remaining view

---

## Deploying to GitHub Pages

This site is 100% static — no build step needed. To deploy:

1. Push all files to the `main` branch
2. Go to your repo's **Settings > Pages**
3. Under "Source", select **Deploy from a branch**
4. Choose **main** branch, **/ (root)** folder
5. Click Save

The site will be live at `https://shivamkanodia19.github.io/clubgirlgolf/` within a few minutes.

**Important:** The `node_modules/` folder is excluded via `.gitignore`. Only the actual site files get deployed: `index.html`, `app.js`, `styles.css`, and the Excel file.

---

## Development

```bash
npm install        # Install live-server (one time)
npm start          # Start dev server with auto-reload at localhost:8080
npm run dev        # Same but doesn't auto-open the browser
```

Edit `index.html`, `styles.css`, or `app.js` — the browser refreshes automatically on save.

### File Structure

```
index.html                              Page layout, modal, all sections
styles.css                              Custom styles (brand colors, cards, badges, modal, tables)
app.js                                  All application logic (~1100 lines):
                                          - Excel parsing
                                          - Calculation engine (demand, inventory, financials)
                                          - Rendering (KPIs, tables, charts)
                                          - Add/Remove SKU
                                          - localStorage persistence
                                          - Excel export
ClubGirlGolf_INVESTOR_READY.xlsx        Source data (10 SKUs, 12 months)
package.json                            Dev dependencies (live-server)
.gitignore                              Excludes node_modules from git
```

### Brand Colors

```
#E83E8C   Primary Pink (headers, buttons, charts)
#FCE4EC   Soft Blush (editable cell backgrounds)
#2E1A2B   Deep Plum (text, dark headers)
#FAF9F7   Off White (page background)
#FF6B6B   Alert Red (stockouts, ORDER NOW)
#3CB371   Success Green (healthy inventory, margin chart)
#F4A261   Warning Orange (ORDER SOON, low stock)
```
