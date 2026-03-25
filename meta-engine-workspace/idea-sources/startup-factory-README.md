# 🏭 Startup Factory

15 production-ready landing pages for micro-SaaS startups, complete with:
- Beautiful, modern designs (each with unique aesthetics)
- Stripe checkout integration
- Nginx vhost configurations
- Hetzner VPS deployment scripts

## 📦 What's Included

### Landing Pages (15 total)

| # | Name | Domain | Price | Description |
|---|------|--------|-------|-------------|
| 1 | InvoiceGhost | invoiceghost.co | $9/mo | AI invoice tracking & payment reminders |
| 2 | MeetingDetox | meetingdetox.com | $12/mo | Calendar analysis & meeting reduction |
| 3 | ReceiptVault | receiptvault.app | $5/mo | Receipt capture & tax categorization |
| 4 | ContractClause | contractclause.io | $12/mo | AI contract review for freelancers |
| 5 | SubscriptionReaper | subscriptionreaper.com | $3/mo | Find & cancel forgotten subscriptions |
| 6 | ColdEmailCraft | coldemailcraft.co | $19/mo | Cold email scoring & improvement |
| 7 | BurnoutRadar | burnoutradar.app | $8/mo | Burnout early warning system |
| 8 | QuitMyJob.guide | quitmyjob.guide | $29 | Exit strategy playbook |
| 9 | LandlordShield | landlordshield.io | $7/mo | Tenant documentation & rights |
| 10 | SideHustleStack | sidehustlestack.co | $19 | Skill-to-income matching |
| 11 | InterviewReplay | interviewreplay.com | $15/mo | Interview recording & feedback |
| 12 | CofounderMatch | cofoundermatch.io | $49 | Cofounder compatibility matching |
| 13 | RefundHunter | refundhunter.co | 20% fee | Overcharge detection & refunds |
| 14 | WFHSetup | wfhsetup.co | $29 | Workspace ergonomic analysis |
| 15 | NeighborNoise | neighbornoise.app | $4/mo | Anonymous noise complaint system |

### Infrastructure

```
startup-factory/
├── index.html              # Portfolio page showing all 15 startups
├── pages/                  # Individual landing pages
│   ├── invoiceghost/
│   ├── meetingdetox/
│   ├── receiptvault/
│   └── ... (12 more)
├── shared/
│   ├── styles.css          # Base design system
│   ├── stripe-checkout.js  # Stripe integration helper
│   ├── success.html        # Payment success page
│   └── cancel.html         # Payment cancelled page
├── nginx/
│   ├── nginx-generator.sh  # Generate all vhost configs
│   └── sites-available/    # Nginx configuration files
├── deploy/
│   ├── setup-hetzner.sh    # VPS provisioning script
│   └── upload-to-server.sh # Deployment script
└── IDEAS.md                # Full startup idea documentation
```

## 🚀 Quick Start

### 1. Preview Locally

```bash
cd startup-factory
python -m http.server 8000
# Open http://localhost:8000
```

### 2. Configure Stripe

Edit `shared/stripe-checkout.js`:

```javascript
const STRIPE_CONFIG = {
  publishableKey: 'pk_live_YOUR_KEY_HERE',
  prices: {
    invoiceghost_monthly: 'price_YOUR_PRICE_ID',
    // ... add your price IDs
  }
};
```

### 3. Deploy to Hetzner

1. Create a Hetzner Cloud account at https://console.hetzner.cloud/
2. Create a CX21 server (~€5.83/month) with Ubuntu 22.04
3. SSH into your server and run setup:

```bash
scp deploy/setup-hetzner.sh root@YOUR_IP:/root/
ssh root@YOUR_IP
bash setup-hetzner.sh
```

4. Upload your files:

```bash
bash deploy/upload-to-server.sh YOUR_SERVER_IP
```

5. Point your domains to the server IP and enable SSL:

```bash
ssh root@YOUR_IP
./deploy-site.sh invoiceghost.co
```

## 💳 Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Create Products in Dashboard > Products
3. Get the Price ID for each product
4. Update `shared/stripe-checkout.js` with your keys
5. Configure webhook endpoints for order fulfillment

## 🌐 Domain Registration

**Domains are NOT included.** You'll need to register them separately.

Recommended registrars:
- Cloudflare Registrar (cheapest)
- Namecheap
- Porkbun
- Google Domains

Estimated cost: ~$10-15 per domain × 15 = $150-225

## 📋 Full Deployment Checklist

- [ ] Choose which startup(s) to launch
- [ ] Register domain(s)
- [ ] Create Stripe account & products
- [ ] Create Hetzner account & server
- [ ] Run `setup-hetzner.sh` on server
- [ ] Update Stripe keys in `stripe-checkout.js`
- [ ] Upload files with `upload-to-server.sh`
- [ ] Point DNS A records to server IP
- [ ] Run `deploy-site.sh` for each domain
- [ ] Test checkout flow
- [ ] Set up email/support system
- [ ] Launch! 🚀

## 🎨 Customization

Each landing page has its own color scheme defined in the `<style>` block. To customize:

```css
:root {
  --accent: #6366f1;        /* Primary color */
  --accent-hover: #818cf8;  /* Hover state */
  --accent-glow: rgba(99, 102, 241, 0.4);
  /* ... */
}
```

## ⚠️ What This Doesn't Include

- ❌ Actual backend/product functionality
- ❌ User authentication
- ❌ Database setup
- ❌ Domain registration
- ❌ Stripe account creation
- ❌ Business registration

This is a **landing page kit** for validation. Build the product after you validate demand.

## 📄 License

MIT - Do whatever you want with these.

---

Built for rapid startup validation. Pick an idea, deploy in an hour, see if anyone wants to pay.
