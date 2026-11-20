# CreatorOS unit-economics model (Document 26, section 8). Edit the prices below and re-run:
#   python3 docs/models/unit_economics.py
# CreatorOS revised foundation - unit economics check
# cost per RAW FOOTAGE HOUR (audio-first upload; originals stay on creator disk)
low  = dict(stt=0.26, llm=0.02, compute=0.02, storage=0.01, thumbs=0.00)
high = dict(stt=0.40, llm=0.20, compute=0.10, storage=0.03, thumbs=0.15)
mid  = {k:(low[k]+high[k])/2 for k in low}
for n,d in [("low",low),("mid",mid),("high",high)]:
    print(n, {k:round(v,3) for k,v in d.items()}, "total", round(sum(d.values()),2))
C = {n:sum(d.values()) for n,d in [("low",low),("mid",mid),("high",high)]}

# LLM sanity: 1 hr talking ~ 9,000 words ~ 12k tokens; 5 passes x 15k in + 2k out
tin, tout = 5*15_000, 5*2_000
for name,(pi,po) in {"small $0.10/$0.50":(0.10,0.50),"standard $1/$5":(1,5)}.items():
    print("LLM", name, round(tin/1e6*pi + tout/1e6*po,3))
# STT sanity: Deepgram Nova-3 $0.0043/min
print("Deepgram Nova-3 batch /hr", round(0.0043*60,3), "multilingual batch /hr", round(0.0052*60,3))

def fee(p):  # merchant of record all-in: ~5% + 1.5% intl + 0.5% subs + $0.50
    return p*0.07 + 0.50

plans = {"Creator":(19,5),"Pro":(39,15),"Studio":(99,40)}
print("\nplan  price hrs  fee   cost@full(high) margin@full  cost@50%(mid) margin@50%")
for n,(p,h) in plans.items():
    f = fee(p)
    full = h*C["high"]; half = h*0.5*C["mid"]
    print(f"{n:8}{p:5}{h:4} {f:5.2f}  {full:6.2f}  {(p-f-full)/p:6.0%}   {half:6.2f}  {(p-f-half)/p:6.0%}")

# overage
print("overage $3/hr margin at high cost:", f"{(3-3*0.07-C['high'])/3:.0%}")

# Free tier: audit + 30 min/month; 30% of free users use the minutes
free_cost = 0.05 + 0.30*0.5*C["mid"]
print("\nfree user cost/month", round(free_cost,3), "x10 free per paid =", round(10*free_cost,2))

# blended ARPU: plan mix 60/30/10.
# ADR-020: one global USD price, so no customer pays a regional price (regional_share = 0).
# Doc 26 s8.3 originally used regional_share = 0.5 at a 50% discount (ARPU 24.75, contribution 16.70).
regional_share, regional_discount = 0.0, 0.5
mix = {"Creator":0.6,"Pro":0.3,"Studio":0.1}
glob = sum(mix[n]*plans[n][0] for n in mix)
blend = (1-regional_share)*glob + regional_share*glob*(1-regional_discount)
cogs = sum(mix[n]*plans[n][1]*0.5*C["mid"] for n in mix)
fees = sum(mix[n]*((1-regional_share)*fee(plans[n][0])
                   + regional_share*fee(plans[n][0]*(1-regional_discount))) for n in mix)
support = 1.0
contrib = blend - cogs - fees - 10*free_cost - support
print(f"global ARPU {glob:.2f} blended ARPU {blend:.2f} cogs {cogs:.2f} fees {fees:.2f} free {10*free_cost:.2f} support {support:.2f} -> contribution {contrib:.2f} ({contrib/blend:.0%})")
for label,fixed in [("lean founder-only",400),("small team (2 ppl, LK)",3000)]:
    n = fixed/contrib
    print(f"break-even {label}: fixed ${fixed}/mo -> {n:.0f} paying customers, MRR ${n*blend:,.0f}")
for target in [5000,10000]:
    n = target/blend
    print(f"MRR ${target}: {n:.0f} paying customers; monthly profit at $3000 fixed: ${n*contrib-3000:,.0f}")
