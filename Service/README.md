# 🔍 API Endpoint Health Check Script

This script provides a step-by-step health check for any HTTPS API domain.  
It is useful for developers, DevOps, and SREs to **quickly identify DNS, connectivity, and SSL certificate issues**.

---

## 📂 File: `check-api-health.sh`

```bash
#!/bin/bash

# === Configuration ===
DOMAIN="chatgpt.com"
DNS_SERVER="8.8.8.8"
FULL_URL="https://$DOMAIN"

# === Step 1: DNS Lookup ===
echo "🔍 [Step 1] DNS Lookup using public DNS ($DNS_SERVER)"
dig +short $DOMAIN @$DNS_SERVER

if [[ $? -ne 0 || -z $(dig +short $DOMAIN @$DNS_SERVER) ]]; then
  echo "❌ DNS lookup failed or domain does not exist (NXDOMAIN)."
  echo "➡️  Check if the domain name is correct and properly registered in DNS (e.g., Route 53)."
  exit 1
else
  IP=$(dig +short $DOMAIN @$DNS_SERVER | head -n1)
  echo "✅ Domain resolves to: $IP"
fi

# === Step 2: HTTPS Connectivity Test ===
echo -e "\n🌐 [Step 2] HTTPS Connectivity Test (headers only)"
curl -I --connect-timeout 5 $FULL_URL

if [[ $? -ne 0 ]]; then
  echo "❌ Could not establish connection to $FULL_URL"
  echo "➡️  Check network, firewall rules, or if the service is running."
else
  echo "✅ Connection successful. Server responded with headers."
fi

# === Step 3: TLS Certificate Inspection ===
echo -e "\n🔐 [Step 3] TLS Certificate Inspection"
echo | openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" 2>/dev/null | openssl x509 -noout -subject -issuer -dates

if [[ $? -ne 0 ]]; then
  echo "❌ SSL certificate check failed."
  echo "➡️  Verify server is serving HTTPS correctly and using a valid certificate."
else
  echo "✅ SSL certificate is present and readable."
fi

# === Step 4: Traceroute ===
echo -e "\n📡 [Step 4] Traceroute to Identify Routing Issues"
traceroute $DOMAIN || traceroute6 $DOMAIN
```

---

## 🧪 Step-by-Step Checks

### ✅ Step 1: DNS Resolution

**Command:**
```bash
dig +short $DOMAIN @$DNS_SERVER
```

**Purpose:**  
Check if the domain exists and resolves to a valid IP address.

**Result Interpretation:**
- ✅ IP address returned → DNS is working.
- ❌ `NXDOMAIN` or empty → Domain does not exist or is not set up in DNS.

---

### ✅ Step 2: HTTPS Connectivity Test

**Command:**
```bash
curl -I --connect-timeout 5 $FULL_URL
```

**Purpose:**  
Verify that the server responds to HTTPS requests with headers.

**Result Interpretation:**
- ✅ Headers received (e.g., `HTTP/1.1 200 OK`) → Server is reachable.
- ❌ Error code (e.g., `(6)` or `(7)`) → Network/firewall/service issue.

---

### ✅ Step 3: TLS Certificate Inspection

**Command:**
```bash
echo | openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" 2>/dev/null | \
openssl x509 -noout -subject -issuer -dates
```

**Purpose:**  
Check if a valid SSL certificate is served.

**Result Interpretation:**
- ✅ Subject and issuer printed → Certificate is valid and served.
- ❌ No output or error → TLS not enabled, expired, or misconfigured cert.

---

### ✅ Step 4: Traceroute

**Command:**
```bash
traceroute $DOMAIN || traceroute6 $DOMAIN
```

**Purpose:**  
Trace the network path to identify where packets might be dropped or delayed.

**Result Interpretation:**
- ✅ Multiple hops showing progression → Indicates network routing path.
- ❌ Stuck or timed out hop → May indicate firewall, routing issue, or packet loss.

---

## 🚀 How to Run

```bash
chmod +x check-api-health.sh
./check-api-health.sh
```

---

## 🧰 Requirements

- `dig` (from `bind-utils` or `dnsutils`)
- `curl`
- `openssl`
- `traceroute`

---

## 🧑‍💻 Example Use Cases

- ✅ **Pre-deploy checks**: Validate DNS and SSL before going live.
- ✅ **Incident diagnosis**: Quickly identify root cause of service unavailability.
- ✅ **CI/CD integration**: Use as a sanity check in deployment pipelines.

---

## ✅ Sample Output and Interpretation

```bash
bash check-api-health.sh
🔍 [Step 1] DNS Lookup using public DNS (8.8.8.8)
104.18.32.47
172.64.155.209
✅ Domain resolves to: 172.64.155.209

🌐 [Step 2] HTTPS Connectivity Test (headers only)
HTTP/2 403 
...
✅ Connection successful. Server responded with headers.

🔐 [Step 3] TLS Certificate Inspection
subject=CN=chatgpt.com
issuer=C=US, O=Google Trust Services, CN=WE1
notBefore=Jun  1 00:45:43 2025 GMT
notAfter=Aug 30 01:45:39 2025 GMT
✅ SSL certificate is present and readable.

📡 [Step 4] Traceroute to Identify Routing Issues
traceroute: Warning: chatgpt.com has multiple addresses; using 172.64.155.209
traceroute to chatgpt.com (172.64.155.209), 64 hops max, 40 byte packets
 1  172.21.8.1 (172.21.8.1)  11.535 ms  6.913 ms  18.099 ms
 2  60-250-73-254.hinet-ip.hinet.net (60.250.73.254)  17.999 ms  10.620 ms  9.718 ms
 3  * * *
 4  * * *
 5  168-95-211-18.tpdb-3316.hinet.net (168.95.211.18)  28.131 ms  10.255 ms
    168-95-229-54.tpdb-3316.hinet.net (168.95.229.54)  10.645 ms
 6  220-128-2-214.tpdt-3032.hinet.net (220.128.2.214)  10.256 ms *
    220-128-1-6.tpdb-3031.hinet.net (220.128.1.6)  6.531 ms
 7  220-128-1-105.tpdb-4211.hinet.net (220.128.1.105)  9.852 ms
    220-128-1-125.tpdb-4211.hinet.net (220.128.1.125)  10.298 ms
    220-128-2-105.tpdb-4212.hinet.net (220.128.2.105)  11.864 ms
 8  203-75-230-129.hinet-ip.hinet.net (203.75.230.129)  12.927 ms
    203-75-230-125.hinet-ip.hinet.net (203.75.230.125)  17.064 ms *
 9  172.64.155.209 (172.64.155.209)  12.866 ms  18.422 ms *
```

**Interpretation:**
- ✅ DNS resolved multiple IPs → Global CDN or load balancing is working
- ✅ Curl returned 403 → Server reachable, but may be protected by WAF or Cloudflare challenge
- ✅ SSL cert valid → The site uses a trusted certificate, no TLS errors
- ✅ Traceroute completed → No major packet loss, routing path is functional



## ✅ Sample Output and Interpretation

### 🔐 TLS Certificate Inspection Result

```bash
[Step 3] TLS Certificate Inspection
subject=CN=chatgpt.com
issuer=C=US, O=Google Trust Services, CN=WE1
notBefore=Jun  1 00:45:43 2025 GMT
notAfter=Aug 30 01:45:39 2025 GMT
✅ SSL certificate is present and readable.
```

### 🧠 Interpretation:

#### ✅ Summary Judgment

- **Certificate valid**: The certificate is correctly configured and readable.
- **Valid period confirmed**: The certificate is currently valid (based on notBefore / notAfter).
- **Trusted issuer**: Issued by Google Trust Services (CN=WE1), a recognized Certificate Authority (CA).
- **TLS works**: Server successfully completed the TLS handshake.

| Field | Meaning |
|-------|---------|
| `subject=CN=chatgpt.com` | The domain name this certificate is issued for. |
| `issuer=...Google Trust Services` | The trusted Certificate Authority that signed the certificate. |
| `notBefore` / `notAfter` | Validity time range – the cert is active between these dates. |

> This confirms that the site uses HTTPS correctly with a valid certificate. If any of these fields are missing or the command fails, it could mean an expired, misconfigured, or self-signed cert.



### 📡 Traceroute Result (Example)

```bash
📡 [Step 4] Traceroute to Identify Routing Issues
traceroute: Warning: chatgpt.com has multiple addresses; using 172.64.155.209
traceroute to chatgpt.com (172.64.155.209), 64 hops max, 40 byte packets
 1  172.21.8.1 (172.21.8.1)  11.535 ms  6.913 ms  18.099 ms
 2  60-250-73-254.hinet-ip.hinet.net (60.250.73.254)  17.999 ms  10.620 ms  9.718 ms
 3  * * *
 4  * * *
 5  168-95-211-18.tpdb-3316.hinet.net (168.95.211.18)  28.131 ms  10.255 ms
    168-95-229-54.tpdb-3316.hinet.net (168.95.229.54)  10.645 ms
 6  220-128-2-214.tpdt-3032.hinet.net (220.128.2.214)  10.256 ms *
    220-128-1-6.tpdb-3031.hinet.net (220.128.1.6)  6.531 ms
 7  220-128-1-105.tpdb-4211.hinet.net (220.128.1.105)  9.852 ms
    220-128-1-125.tpdb-4211.hinet.net (220.128.1.125)  10.298 ms
    220-128-2-105.tpdb-4212.hinet.net (220.128.2.105)  11.864 ms
 8  203-75-230-129.hinet-ip.hinet.net (203.75.230.129)  12.927 ms
    203-75-230-125.hinet-ip.hinet.net (203.75.230.125)  17.064 ms *
 9  172.64.155.209 (172.64.155.209)  12.866 ms  18.422 ms *
```

### 🧠 Interpretation:

#### ✅ Summary Judgment

- **Traceroute passed**: The target IP was successfully reached.
- **Network path stable**: Latency is low and consistent.
- **No packet loss**: Despite some hops not replying (firewall), final destination was reached smoothly.
- **CDN verified**: Request hit Cloudflare's local edge server, confirming proper CDN routing.


| Item | Meaning |
|------|---------|
| ✅ Destination reached | Hop 9 shows successful arrival at `172.64.155.209`, a Cloudflare edge node. |
| ✅ Normal latency | All hop times are under 30ms, indicating a healthy local network. |
| ⚠️ Hidden intermediate hops | Hops 3–4 show `* * *`, meaning no ICMP response—often due to firewall or router config. |
| ✅ CDN hit | The domain is served via Cloudflare, so the request was routed to a nearby CDN node. |

> This route represents Taiwan (Hinet ISP) to Cloudflare's Taiwan edge node—healthy network, no packet loss.

If diagnosing cross-region delays or international traffic issues, `traceroute` helps locate where packets are being dropped or rerouted.
