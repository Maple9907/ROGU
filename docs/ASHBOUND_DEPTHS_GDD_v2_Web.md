# ASHBOUND DEPTHS — *Vực Tro Tàn*
### GDD + Tech Spec · **Web/Mobile Edition v2.0** (HTML5 · PWA · Offline)
> Bản này **thay thế hoàn toàn** bản v1.0 (PC/Steam). Mục tiêu: đọc xong là code được ngay, **không còn chỗ nào phải đoán**. Mọi con số là *giá trị khởi điểm đã chốt*; chỉnh bằng playtest ở §26–27 nhưng **đừng bỏ trống**.
> Quy ước: `t` = tile (16px logic) · `f` = frame logic (1/60s) · `[ID]` = luật có thể tham chiếu khi code/test · 🟢 Must · 🟡 Should · ⚪ Could.

---

## 00. Bản cũ hiểu sai gì & các quyết định đã chốt

### 00.1 Những chỗ bản v1.0 sai/lệch so với ý của m
| # | Bản v1.0 | Vấn đề | Bản v2.0 |
|---|---|---|---|
| 1 | Windows/Linux/macOS/**Steam Deck**, Steam achievement, launcher | Sai nền tảng | **Web + mobile (HTML5)**, cài PWA, chạy offline sau lần tải đầu |
| 2 | Godot 4.3 | Không chạy web mobile nhẹ | **Vanilla JS (ES modules) + Canvas 2D + WebAudio**, build ra **1 file `index.html`** (+3 file PWA) |
| 3 | Bàn phím/chuột/gamepad, remap | Mobile không có | **Touch là chính** (joystick ảo + nút), KB/chuột phụ, gamepad 🟡 |
| 4 | Premium 14.99 USD, ESRB/PEGI, EULA, Steam Cloud | Không áp dụng | Miễn phí, không ads/MTX/login (xem D-03) |
| 5 | Run 45–70 phút, 9 layer/biome (~45 phòng) | Quá dài cho mobile bị kill tab | **7 layer/biome, 35 phòng, run 25–40 phút**, autosave mỗi phòng |
| 6 | 10 ngôn ngữ, 180 relic, 40 vũ khí, 400 chunk, 80 achievement, 60 enemy | Không khả thi 1 dev | **Nội dung launch chốt cứng ở §00.3**, thêm sau bằng data (không sửa code) |
| 7 | Hub đi bộ được | Tốn công, thao tác mobile kém | **Hub = màn hình minh họa có hotspot** (D-06) |
| 8 | `[ENM-01]` HP ×(1+0.45×(B−1)) | **Mâu thuẫn** với bảng DPS §26.2 cũ (HP địch B5 ghi 120–150 nhưng công thức ra chỉ ~85–95) | Sửa thành HP ×1.45^(B−1) (§9.3) |
| 9 | `[THR-01]` dựa trên 9 layer | Sai khi còn 7 layer | Tính lại §9.6 |
| 10 | Cây Tàn Lửa 48 node ≈ 12.000 Tàn Hồn (60–80 run) | Quá dài với run ngắn | 36 node ≈ 6.000 Tàn Hồn (~30 run) |
| 11 | Replay `.ashrun`, 2P co-op, Weekly, Gương Ký Ức hub | Không thực tế lúc launch | Cắt/đẩy v1.1 (§29) |
| 12 | VFX ≤ 2.000 hạt GPU đồng thời (§19 cũ) | Canvas 2D chạy bằng CPU, không có GPU particle | Cap cứng ở §24.3: hạt 400, đạn 320, địch 24 |

### 00.2 Decision Log (t đã chốt thay m — muốn đổi thì đổi *ở đây*, các mục khác tự suy ra)
| ID | Quyết định | Lý do |
|---|---|---|
| D-01 | **Landscape-only** khi chơi; portrait hiện màn "Xoay ngang" | Twin-stick/dash cần bề ngang; iPhone **không** khóa xoay được (không có Fullscreen API) nên dùng overlay CSS |
| D-02 | Vanilla JS + Canvas 2D, **không** framework/engine, build bằng `esbuild` ra 1 file | m quen ship single-file; không phụ thuộc; load nhanh |
| D-03 | **Miễn phí, không ads/MTX/login/telemetry**; tuỳ chọn 1 nút "Ủng hộ" (link ngoài) trong Cài đặt | Giữ trụ cột P5; đổi được không ảnh hưởng gameplay |
| D-04 | Internal render **216px cao** × (360–480 rộng), CSS upscale `image-rendering: pixelated` | Fill-rate nhỏ → 60FPS trên máy tầm trung |
| D-05 | Sim cố định **60Hz**, render nội suy (mượt trên 90/120Hz), tuỳ chọn 30FPS tiết kiệm pin | Deterministic + mượt |
| D-06 | Hub = màn hình có hotspot (không đi bộ) | Rẻ, hợp touch |
| D-07 | 1 vũ khí/run (bỏ swap) | Giảm UI/nút trên mobile |
| D-08 | Đi **1 chiều** (không quay lại phòng đã dọn) | Đơn giản hoá graph + UX |
| D-09 | Save: `localStorage` + **Xuất/Nhập mã save** | Safari xoá dữ liệu sau 7 ngày không mở (trừ bản cài PWA) |
| D-10 | Art: **Tier A** = sprite tự sinh bằng code (chơi được ngày 1) → **Tier B** = atlas PNG thay thế không đổi code | Không bị nghẽn vì chưa có art |
| D-11 | Audio: 100% **sinh bằng WebAudio** (không file âm thanh) | Single-file, offline, nhẹ |
| D-12 | Ngôn ngữ: **VI (chính) + EN**; khung i18n key→string mở rộng được | |
| D-13 | UI (HUD/menu/tooltip) = **DOM/CSS**, thế giới game = **Canvas** | Chữ tiếng Việt có dấu chuẩn, scale tốt, dễ truy cập |
| D-14 | Mini-boss, Trapper/Bonecaller, Weekly, Boss Rush, Replay, 2P → **v1.1+** | Giữ launch gọn |
| D-15 | Tag Resonance thay cho "Bộ (Set)" | Rẻ hơn, sâu hơn (§8.5) |

### 00.3 Nội dung launch v1.0 (con số chốt)
| Hạng mục | Số lượng | Hạng mục | Số lượng |
|---|---|---|---|
| Class | **4** (Ashblade, Shadow Archer, Cinder Mage, Ironwarden) | Boss chính | **5** + Vua Tro + Hư Không |
| Vũ khí | **12** (3/class) | Kẻ địch | **40** (7 thường + 1 elite × 5 biome) |
| Relic | **60** + 6 Evolved | Elite affix | **10** |
| Rune nguyên tố | 5 | Consumable | **10** |
| Curse | 8 | Event | **12** |
| Shrine | **8** | Reaction | 6 |
| Mutator | **10** | Heat | 0–20 |
| Achievement | **30** | Biome | 5 + Trái Tim Tro + Hư Không |
| NPC Hub | 5 | Ngôn ngữ | VI, EN |

---

## 0. Thông tin nhanh
| Mục | Giá trị |
|---|---|
| Tên | Ashbound Depths (Vực Tro Tàn) |
| Thể loại | Action Roguelike, top-down 2D, real-time, room-based |
| Góc nhìn | Top-down 3/4, di chuyển analog 360°, aim 360° (có aim assist) |
| Người chơi | 1 |
| Nền tảng | **Trình duyệt** (Chrome/Edge/Firefox/Safari, Android + iOS + Desktop), cài được như PWA |
| Công nghệ | HTML5 Canvas 2D · WebAudio · Pointer Events · không thư viện ngoài |
| Mô hình | Miễn phí · không ads/MTX · không login · chơi offline |
| Thời lượng | 1 run = **25–40 phút** · clear lần đầu ≈ 8–12 giờ · completionist 30+ giờ |
| Dung lượng | `index.html` ≤ **1.5 MB** (đã nén gzip ≤ 500 KB) |
| Thiết bị mục tiêu | Android 9+ (RAM 3GB, ~Snapdragon 665), iOS 15+ (iPhone 8+), Chrome/Edge/Firefox/Safari desktop |
| Hướng màn hình | Landscape (D-01) |
| Ngôn ngữ | VI, EN |

---

## 1. Tầm nhìn & Trụ cột

### 1.1 Elevator pitch
Bạn là **Người Mang Lửa** — kẻ bị nguyền không thể chết hẳn. Mỗi lần ngã xuống trong **Tháp Tro**, ngọn lửa trong ngực kéo bạn về **Doanh Trại Lò Lửa**. Vượt 5 tầng địa ngục, xây build từ relic, đánh bại **Vua Tro** và quyết định số phận của ngọn lửa — ngay trên điện thoại, một buổi nghỉ trưa một run.

### 1.2 Năm trụ cột
| # | Trụ cột | Thực thi (web/mobile) |
|---|---|---|
| P1 | **Combat công bằng & chính xác** | Mọi đòn có telegraph (§5.4); input buffer + aim assist chống "chết vì ngón tay"; chết = lỗi đọc đòn |
| P2 | **Build phá cách** | Reaction nguyên tố + Evolution + Tag Resonance; cho phép "build gãy" có chủ đích |
| P3 | **Chết vẫn tiến bộ** | Tàn Hồn, mở khóa, Mastery; run nào cũng được thưởng |
| P4 | **Run gọn, chơi được một buổi** | 25–40 phút; **autosave mỗi phòng**; thoát/kill tab/khoá màn hình không mất tiến trình |
| P5 | **Tôn trọng người chơi** | Offline, không login, không ads, không dark pattern, xuất/nhập save |
| P6 | **Mobile-first thật sự** | Nút ≥ 48 CSS px, một tay trái-phải đều chơi được, 60FPS, rung/âm hợp lý, pin không cháy |

### 1.3 USP
1. **Reaction nguyên tố** + **Relic Evolution** + **Tag Resonance**.
2. **Seed Link** (🟢 mới): `…/#seed=ASH-XXXX-XXXX&c=ashblade&h=3` — gửi link qua Zalo/FB là người nhận chơi *đúng* map đó, không cần server.
3. **Share Card** (🟢 mới): hết run tự vẽ ảnh PNG (class, build, seed, thời gian) → Web Share API/tải về.
4. **Boss Gương** (Hư Không): sao chép build run gần nhất đọc từ save local.
5. **Heat 0–20** + Mutator → replay hàng chục giờ.
6. **100% offline** sau lần tải đầu (service worker).

### 1.4 Đối tượng
Fan Hades / Dead Cells / Vampire Survivors; 14–35 tuổi; chơi điện thoại; ưa run ngắn, skill-based.

### 1.5 Non-goals (không làm ở 1.0)
Online co-op/PvP · gacha/MTX/ads · XP trong run (sức mạnh đến từ relic/vũ khí) · open world · voice · đăng nhập/cloud save · swap vũ khí giữa run · quay lại phòng cũ.

---

## 2. Core Loop
```
MICRO (5–30s):   Đọc telegraph → Né/Parry → Combo → Skill → Nhặt drop
MESO  (1–2 phút): Vào phòng → Dọn wave → Chọn cửa (icon thưởng) → Nhận reward
MACRO (25–40 phút): Biome 1→5 (7 phòng/biome, boss ở phòng 7) → Vua Tro → Kết thúc / chết
META  (giữa run): Hub → tiêu Tàn Hồn → mở khóa → chọn build → run mới
```
**Vòng động lực:** thấy relic lạ trong Codex → muốn thử → mở khóa → build mới → boss lộ đòn mới → đi sâu hơn → mở Heat cao hơn.

---

## 3. Cấu trúc Run & Thế giới

### 3.1 Tổng quan
- 1 run = **5 Biome** + **Trái Tim Tro** (boss cuối) + (bí mật) **Hư Không**.
- Mỗi Biome là đồ thị **7 layer (L1–L7)**: L1 = 1 node; L2–L5 = 2–3 node/layer; **L6 = 1 node Rest**; **L7 = 1 node Boss**.
- Người chơi đi **1 chiều** (không quay lại). Tổng = 5×7 = **35 phòng** + 4 màn chuyển biome "Lối Nghỉ" + phòng Vua Tro.

### 3.2 Năm Biome
| # | Biome | Chủ đề | Hazard đặc trưng | Nguyên tố chủ đạo | Boss |
|---|---|---|---|---|---|
| 1 | **Nghĩa Địa Tro** | Hầm mộ, xương, tro | Gai đất, bẫy nổ, bia mộ chắn | Physical / Void | Gorrak, Xương Vương |
| 2 | **Rừng Nấm Độc** | Nấm khổng lồ, bào tử | Vũng độc, dây leo giữ chân | Venom | Mycelia, Mẹ Nấm |
| 3 | **Thành Chìm** | Thành phố ngập nước | Nước dâng/hạ, dòng chảy | Volt / Frost | Vael, Kỵ Sĩ Chìm |
| 4 | **Lò Rèn Rực Lửa** | Xưởng luyện, kim loại nóng chảy | Dung nham, băng chuyền, búa ép | Fire | Ignar, Thợ Rèn Vô Tận |
| 5 | **Thánh Đường Lặng** | Nhà thờ đổ nát, ánh sáng | Tia sáng quét, chuông, gương | Holy→Void | Seraphine, Nữ Tế |
| F | **Trái Tim Tro** | Lõi ngọn lửa | Bullet pattern | Tất cả | Vua Tro |
| S | **Hư Không** (bí mật) | Không gian trống | Trọng lực đảo | Void | Người Mang Lửa Rỗng |

### 3.3 Loại phòng
| Loại | Mô tả | Tần suất/biome |
|---|---|---|
| Combat | 2–3 wave (§9.6) | 2–3 |
| Elite | 1 elite + escort, thưởng tốt | 0–2 (chỉ L4–L5) |
| Shop | Bán relic/consumable/Whetstone | 1 (L3–L5) |
| Rest (Lửa Trại) | Hồi 40% HP, nạp Flask, nâng Rank vũ khí | 1 (**L6 bắt buộc**) |
| Event | Lựa chọn rủi ro/thưởng (§13.1) | 1 |
| Shrine | Buff/curse đổi chác (§13.2) | 0–1 |
| Treasure | Rương có bẫy/thử thách | 0–1 |
| Secret | Phòng ẩn, chỉ biome 2/3/4 (§13.4) | 0–1 |
| Boss | Đấu boss + rương thưởng | 1 (**L7**) |

### 3.4 Luật cấu trúc
- `[STR-01]` L1 luôn Combat. L6 luôn Rest. L7 luôn Boss.
- `[STR-02]` Mỗi biome có **≥1 Shop** nằm ở L3–L5 và **≥1 đường** đi qua nó; không 2 Shop ở cùng layer; không 2 node Shop/Elite nối trực tiếp nhau.
- `[STR-03]` Elite chỉ ở L4–L5; **≤2 Elite/biome**.
- `[STR-04]` Mỗi **cửa ra** hiển thị icon phần thưởng của phòng kế: Vàng · Relic · Whetstone (Rank) · Heal · Consumable · Mystery(?) · Key. Không giấu rủi ro.
- `[STR-05]` Event ≥1/biome; Shrine ≤1/biome; Treasure ≤1/biome; Secret chỉ có nếu người chơi có **Gợi ý** (§13.4).
- `[STR-06]` **Không quay lại** phòng đã dọn (D-08). Có nút **Bản đồ** (xem đồ thị biome hiện tại, chỉ đọc).
- `[STR-07]` Cửa ra là **cửa vật lý** ở tường Đông (§11.2). Phòng dọn xong → cửa mở, phát sáng icon.

---

## 4. Điều khiển, Camera, Game Feel

### 4.1 Màn hình & tỉ lệ
- `[VIEW-01]` Canvas **backing store cố định**: cao **216 px**, rộng `W = clamp(even(round(216 × innerWidth / innerHeight)), 360, 480)`. CSS phóng to vừa khung (`object-fit` kiểu contain), `image-rendering: pixelated`, nền thanh đen `#0b0a0d`. **Không** dùng `devicePixelRatio` cho backing store (giữ fill-rate nhỏ).
- `[VIEW-02]` Lớp UI/HUD/nút cảm ứng là **DOM phủ toàn viewport** (không phủ theo canvas) và né `env(safe-area-inset-*)`. Viewport tối thiểu hỗ trợ: **640×320 CSS px**.
- `[VIEW-03]` Portrait → overlay "Xoay ngang để chơi", sim tạm dừng (D-01). Thử `screen.orientation.lock('landscape')` *chỉ khi* PWA standalone/fullscreen hợp lệ; lỗi thì bỏ qua (iPhone không hỗ trợ).
- `[VIEW-04]` Nút "Toàn màn hình" (Cài đặt) dùng Fullscreen API **chỉ khi có** (`document.fullscreenEnabled`); iPhone → hướng dẫn "Thêm vào Màn hình chính".

### 4.2 Bố cục cảm ứng (Scheme A — **mặc định**, "Tự nhắm")
Toạ độ **tâm** nút = (dx, dy) tính từ **góc dưới-phải** viewport (đã cộng safe-area + lề 16px), đơn vị CSS px × `buttonScale` (80–140%, mặc định 100%). Vùng chạm thật = **max(đường kính, 48px)**.

| Nút | Hành động | Tâm (dx,dy) | Ø | Ghi chú |
|---|---|---|---|---|
| **A** Đánh | Đòn nhẹ (chạm/giữ = lặp combo, ranged = tự bắn) | (84, 84) | 92 | Nút lớn nhất, ngón cái mặc định |
| **H** Nặng | Đòn nặng (§5.3) | (176, 128) | 64 | |
| **D** Dash | Dash | (176, 44) | 68 | |
| **Q** | Skill Q | (92, 184) | 60 | Vòng CD radial |
| **E** | Skill E | (178, 208) | 60 | |
| **R** Surge | Ember Surge | (36, 150) | 52 | Chỉ sáng khi đầy |
| **F** Flask | Ember Flask | (260, 84) | 56 | Hiện số charge |
| **Joystick** | Di chuyển | **nổi**: xuất hiện tại điểm chạm trong vùng trái | R=56 | Xem dưới |
| Pause | Tạm dừng | góc trên-phải (36,36) từ góc trên-phải | 40 | |
| Map | Bản đồ biome | (84,36) từ góc trên-phải | 40 | |
| Consumable ×3 | Dùng vật phẩm | (144/196/248, 38) từ góc trên-phải | 44 | Hitbox ≥ 48 |

- `[CTL-01]` **Joystick nổi:** vùng kích hoạt = nửa trái viewport (x < 45%, y > 15%). Chạm → đặt gốc tại điểm chạm. `d = touch − origin`; nếu `|d| > R` thì **gốc bị kéo theo** ngón (giữ `|d| = R`). Deadzone **12%R**. `m = clamp((|d|/R − 0.12)/0.88, 0, 1)`; tốc độ = `moveSpeed × (0.4 + 0.6×m)` khi `m>0`. Hướng = analog 360° (không snap 8 hướng). Thả = dừng ngay.
- `[CTL-02]` Vùng giữa (45–55%) **không nhận** joystick (tránh chạm nhầm); nút bên phải có độ ưu tiên hit-test cao hơn joystick.
- `[CTL-03]` **Mirror**: Cài đặt → "Tay trái" đảo toàn bộ bố cục trái↔phải.
- `[CTL-04]` Nút idle opacity 70%, nhấn 100% + scale 0.92; đang CD: mờ + vòng radial + số giây; thiếu tài nguyên: rung nhẹ (CSS) + âm "no".
- `[CTL-05]` Hold-to-repeat: giữ **A** → hàng đợi combo liên tục theo buffer; không cần nhấp lại.
- **Scheme B 🟡 "Twin-stick":** ẩn **A**, thay bằng **stick phải nổi** (nửa phải, x>55% và không trúng nút): hướng = aim, tự bắn/đánh khi lệch >25%. Các nút còn lại giữ nguyên. Bật trong Cài đặt.

### 4.3 Aim assist (Scheme A)
- `[AIM-01]` Khi nhấn **A/H/Q/E**: `facing` = hướng di chuyển cuối (nếu đứng yên = hướng đánh cuối). Chọn mục tiêu:
  1. Kẻ địch sống, targetable, trong `reach` (cận chiến: `range + 2t`; tầm xa: `11t`) **và** trong nón ±75° quanh `facing` → lấy **gần nhất**.
  2. Không có → gần nhất bất kỳ trong `reach`.
  3. Không có → đánh theo `facing`.
- `[AIM-02]` Hướng đánh **khoá** ở frame bấm (cận chiến khoá suốt cú vung); tầm xa **chọn lại mỗi 6f** khi giữ.
- `[AIM-03]` Cận chiến có **auto-step** 0.5t về phía mục tiêu khi mục tiêu cách >1.5t.
- `[AIM-04]` Skill AoE đặt điểm (Meteor): điểm = vị trí mục tiêu chọn như trên, nếu không có = `facing × 5t`.
- Tắt aim assist (Cài đặt) → luôn đánh theo `facing` (hoặc stick phải ở Scheme B).

### 4.4 Bàn phím/chuột & Gamepad
| Hành động | KB+Chuột | Gamepad 🟡 |
|---|---|---|
| Di chuyển | WASD / mũi tên | Stick trái |
| Aim | Con trỏ chuột (bỏ aim assist) | Stick phải |
| Đòn nhẹ | Chuột trái (giữ = lặp) | RT/R2 |
| Đòn nặng | Chuột phải | RB/R1 |
| Dash | Space | A/Cross |
| Skill Q / E | Q / E | X / Y (Square / Triangle) |
| Ember Surge | R | LB+RB |
| Flask | F | D-pad ↑ |
| Consumable | 1 / 2 / 3 | D-pad ←/→ chọn, B dùng |
| Bản đồ / Pause | Tab / Esc | Select / Start |
- `[INP-01]` Phím **remap được** (lưu trong settings). Hot-swap chạm↔KB↔pad không cần tải lại: nguồn input cuối cùng quyết định việc hiện/ẩn nút cảm ứng.

### 4.5 Quy tắc input (kỹ thuật)
- `[INP-02]` **Pointer Events** + `setPointerCapture`; mỗi `pointerId` gắn với **đúng 1** điều khiển đến `pointerup/pointercancel`. CSS: `touch-action:none; user-select:none; -webkit-touch-callout:none; overscroll-behavior:none`; chặn `contextmenu`; viewport meta `width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover`.
- `[INP-03]` Event handler **chỉ ghi cờ**; logic đọc cờ **một lần mỗi tick sim** (60Hz). Không xử lý game trong event.
- `[INP-04]` **Input buffer 8f** (133ms; bản cũ 6f, +2f cho độ trễ cảm ứng) cho Dash và đòn kế; buffer bị xoá khi chuyển phòng/nhận hit-stun.
- `[INP-05]` `visibilitychange→hidden`, `pagehide`, `blur` ⇒ **tự Pause + autosave**. Quay lại: màn "Chạm để tiếp tục" + đếm ngược 1.5s (không tính vào thời gian run).
- `[INP-06]` **Haptics** (`navigator.vibrate`, bật mặc định, chỉ Android; iOS bỏ qua êm, dùng hiệu ứng hình thay thế):
| Sự kiện | Mẫu (ms) |
|---|---|
| Crit | 10 · Đòn nặng trúng: 18 |
| Bị trúng | 40 · Parry/Perfect Dodge: 12-30-12 |
| Dash | 6 · Phase boss mới: 60 · Skill nổ lớn: 25 |
| HP < 25% | [20,120,20] mỗi 1.2s (tắt riêng được) |
Đòn nhẹ trúng **không** rung (quá dày). Rate-limit ≥ 80ms giữa 2 lần rung.

### 4.6 Camera
- Bám nhân vật, **lookahead 20%** theo `facing`, mượt `cam += (target − cam) × 0.16` mỗi tick (camera là *cosmetic*, không đưa vào sim tất định). Khoá biên phòng; phòng nhỏ hơn viewport thì **căn giữa**.
- **Boss:** điểm nhìn = `0.6×player + 0.4×boss`, kẹp để người chơi luôn cách mép khung ≥ **2t**. Không zoom (độ phân giải nội bộ cố định).
- **Screen shake:** biên độ px nội bộ, suy giảm mũ `×0.85/tick`, **cap 6px**; slider 0–100%; "Giảm chuyển động" = 0.

### 4.7 Game Feel (bắt buộc)
| Sự kiện | Hitstop | Shake (px) | Khác |
|---|---|---|---|
| Đòn nhẹ trúng | 3f | 1 | Flash trắng 2f, 4 hạt |
| Đòn nặng | 6f | 2.5 | Knockback 1.5t |
| Crit | +2f | +20% | Số vàng to, âm "ting" |
| Parry/Perfect Dodge | 8f | 2 | Slow-mo 0.25× trong 9f (0.15s), flash trắng-vàng |
| Giết boss | 20f | 5 | Slow-mo 0.3× trong 0.8s |
| Bị trúng | 5f | 3 | Viền đỏ, i-frame 0.6s |
- `[FEEL-01]` Hitstop = **đóng băng sim của đối tượng trúng + người đánh** (không đóng băng toàn cục) để không làm kẹt input buffer.
- `[FEEL-02]` Slow-mo = nhân `dt` sim (vẫn 60 tick/giây nhưng tiến mô phỏng ít hơn) — **không** đổi `timestep` cố định.

---

## 5. Hệ thống chiến đấu

### 5.1 Chỉ số người chơi (base)
| Stat | Base | Ghi chú |
|---|---|---|
| Max HP | theo class (§6) | Meta +≤25% |
| Armor | 0 (Ironwarden +20) | Giảm sát thương % (§5.2) |
| ATK% | +0% | **Cộng dồn** (additive) |
| ATK "more" | ×1 | **Nhân** (multiplicative) |
| Crit Chance | 5% | Cap 100% |
| Crit Damage | 150% | Cap 400% |
| Attack Speed | 100% | Cap 250% |
| Move Speed | **5.5 t/s** | Cap 8.5 |
| Dash charges | 2 | Hồi **1.2s/charge** (72f, nối tiếp) |
| Cooldown Reduction | 0% | Cap 50% |
| Luck | 0 | §12.4 |
| Resist (Fire/Frost/Volt/Venom/Void) | 0% | Cap 75% |
| Elemental Bonus | 0% | Mỗi nguyên tố riêng |
| Hitbox người chơi | bán kính **5px** (0.31t) | Hurtbox = hitbox |

### 5.2 Pipeline sát thương (giữ từ v1.0, thêm làm rõ)
```
[DMG-01] Raw   = WeaponBase × ComboMult × (1 + ΣATK%) × ΠATK_more
         (Skill: Raw = class.skillBase × skillMult × (1 + 0.12×(Rank−1)) × (1 + ΣATK%) × ΠATK_more)
[DMG-02] Crit  = rng_combat() < CritChance ? Raw × CritDmg : Raw
[DMG-03] Elem  = Crit × (1 + ElemBonus) × (1 − TargetResist)      // TargetResist có thể âm = yếu hơn
[DMG-04] Mit   = min(0.75, Armor / (Armor + 60 + 12 × BiomeIdx))
[DMG-05] Final = max(1, round(Elem × (1 − Mit)))
[DMG-06] PoiseDmg = Final × weapon.poiseMult × (heavy ? 2 : 1)     // trừ vào thanh poise
```
- `[DMG-07]` Thứ tự: Raw → Crit → Elemental → Defense → Barrier/Shield → HP.
- `[DMG-08]` Nội bộ float; **làm tròn ở Final**; hiển thị số nguyên.
- `[DMG-09]` **DoT không crit, không kích on-hit relic**. DoT bỏ qua Armor (chỉ nhân resist).
- `[DMG-10]` **Snapshot DoT:** khi áp status, lưu `snap = Raw` của đòn áp (trước crit). Mỗi stack giữ snap riêng; áp thêm → stack+1 (đến max), refresh thời gian; DoT/s = `Σ(snap_i × tỉ lệ)`.
- `[DMG-11]` **Người chơi nhận đòn:** `Final = round(enemyDmg × biomeDmgMult × heatMult × (1 − resist) × (1 − Mit))`, tối thiểu 1; trừ Barrier trước rồi mới tới HP.
- `[DMG-12]` Giá trị `% sát thương gốc` của status/relic = % của `snap` (Raw đòn áp), không phải % HP.

### 5.3 Tấn công & Né (frame data ở 60Hz)
| Cơ chế | Chi tiết |
|---|---|
| Combo nhẹ | 3 đòn (hoặc theo vũ khí §7): ×1.0 / ×1.0 / ×1.4; **hủy vào Dash** từ frame ≥ 60% tổng frame của đòn đó, và bất kỳ lúc nào trong *recovery* |
| Đòn nặng (**nút H**) | Giữ H **36f (0.6s)** rồi thả = **×2.2**, poise ×2, knockback 1.5t. Thả sớm = huỷ (không mất CD). Vũ khí tầm xa: giữ để tích lực (§7) |
| Dash | **4t trong 11f**, **i-frame f2–f10 (9f ≈ 0.14s)**, 2 charge; **dash-attack**: đòn nhẹ trong 12f sau khi bắt đầu dash ×**1.3** |
| Parry | Cửa sổ **9f (0.15s)**, chỉ class có parry (Ashblade-E, Ironwarden-E). Thành công: địch **stun 1.5s**, +10% Surge, hitstop 8f |
| Perfect Dodge | Mọi class: dash có i-frame **nuốt 1 đòn trong 6f cuối trước khi đòn trúng** → +8% Surge, địch trúng Weak 3s |
| Grace | Sau khi trúng đòn: bất tử **0.6s (36f)** |
| Poise | Mỗi kẻ địch có thanh poise. Vỡ → **Stagger 2.0s** (bất động, +30% dmg nhận), sau đó **miễn vỡ 4s**. Hồi 15%/s sau 1.5s không bị trúng poise-dmg. Boss: Stagger 1.0s + DR (STA-01) |
| Ngắt đòn | Thường: ngắt được ở Telegraph/Recover; Elite: chỉ ở Recover; Boss: không bị ngắt (poise vỡ → Stagger *sau khi* đòn xong) |
| Ember Surge | Thanh 0–100; nạp: sát thương gây ra (1 điểm / 40 dmg), parry +10, perfect dodge +8. Xả (nút R, khi đầy) = **buff 8s (+25% ATK, +20% AS, CD skill −50%) + nổ AoE r=3t ×2.5 Raw**. Thanh về 0 |
| Ember Flask | 2 charge/run (meta +1), dùng = hồi **35% HP trong 0.8s** (hồi dần), có animation 12f có thể bị ngắt bởi dash. Nạp đầy ở Rest |

### 5.4 Telegraph (P1 — luật vàng)
- `[TEL-01]` Mọi đòn kẻ địch có telegraph ≥ **0.4s (24f)** (thường), ≥ **0.6s (36f)** (elite), ≥ **0.8s (48f)** (boss — đòn lớn).
- `[TEL-02]` Mã màu: **Đỏ** `#ff3b3b` = né/chặn được · **Vàng** `#ffd23b` = parry/perfect-dodge (thưởng) · **Tím** `#b84bff` = **phải né** (không chặn/parry).
- `[TEL-03]` Hình vùng AoE hiển thị trước trên sàn; lúc hết telegraph **khớp thời điểm gây sát thương ±2f**. Phần tô **lấp dần** từ tâm/gốc ra ngoài theo tiến độ.
- `[TEL-04]` Không có đòn "ngoài màn hình" trúng người chơi; đạn phải xuất hiện trong khung nhìn ≥ **0.5s** trước khi tới.
- `[TEL-05]` Không dùng RNG để quyết định đòn *đã telegraph* có trúng hay không. (Ngoại lệ: trạng thái Blind của Steam → đòn "hụt" được **vẽ mờ** ngay từ đầu telegraph.)
- `[TEL-06]` **Chế độ mù màu** (§18): Đỏ = tô đặc; Vàng = viền **nét đứt** + vòng xung; Tím = **gạch chéo** + viền dày; kèm icon góc trên vùng (✕ / ◎ / ▨).
- `[TEL-07]` Heat 4 giảm 10% thời gian telegraph nhưng **không bao giờ** dưới sàn `TEL-01`. Hòa Bình: +20%.
- `[TEL-08]` Telegraph đếm theo **tick sim**, không theo thời gian thực → tụt FPS không làm telegraph ngắn đi.

### 5.5 Nguyên tố & Hiệu ứng trạng thái
Nguyên tố: **Physical, Fire (Ember), Frost, Volt, Venom, Void**.

| Status | Hiệu ứng | Thời gian | Stack / ghi chú |
|---|---|---|---|
| **Burn** | 12% snap/s mỗi stack (tick 0.5s) | 3s | ×3 stack (làm mới) |
| **Chill** | −20% tốc di chuyển & đánh mỗi stack | 4s | 3 stack → **Freeze** |
| **Freeze** | Bất động; +25% dmg Physical nhận | 1.5s | Miễn nhiễm 6s sau đó |
| **Shock** | Mỗi đòn trúng: lan **30%** dmg sang tối đa **2** địch trong **4t** (ICD 0.5s/mục tiêu) | 3s | Không cộng dồn |
| **Poison** | 10% snap/s mỗi stack; −50% hồi máu nhận | 5s | Tới 10 stack |
| **Bleed** | 20% snap/s mỗi stack (**×2 khi mục tiêu đang di chuyển**) | 4s | ×5 stack |
| **Void Mark** | Đủ 4 stack → **nổ** = **300% Raw đòn cuối**, AoE r=2t (người khác 120%), xoá stack | 6s | ×4; ICD nổ 4s/mục tiêu |
| **Stun** | Bất động, mất hành động | 1–2s | DR (STA-01) |
| **Weak** | −25% sát thương gây ra | 5s | Không cộng |
| **Fear** | Bỏ chạy khỏi người chơi | 2s | Elite/Boss miễn nhiễm |
| **Blind** | 50% đòn của địch **hụt** (quyết định lúc bắt đầu telegraph, vẽ mờ) | 3s | Chỉ từ Steam |

**Reaction** (khi 2 nguyên tố chạm nhau trên cùng mục tiêu; **ICD 3s/mục tiêu**; "ATK" = Raw của đòn kích hoạt):
| Reaction | Điều kiện | Hiệu ứng (chính xác) |
|---|---|---|
| **Steam** | Burn + Chill | AoE r=3t tức thì 80% ATK, áp **Blind** 3s; tiêu thụ cả Burn và Chill |
| **Superconduct** | Shock + Chill | Mục tiêu và địch trong 2t: **−40% Armor 6s**; tiêu thụ Chill |
| **Toxic Blaze** | Burn + Poison | Nổ r=2t = Σ Poison còn lại ×2 (tức thì), Poison **lan** sang địch trong 3t (1 stack); tiêu thụ Burn |
| **Overload** | Burn + Shock | Nổ AoE r=2.5t **150% ATK** + knockback 3t; tiêu thụ cả hai |
| **Detonation** | Void Mark + bất kỳ status nguyên tố | **Nổ Void ngay** (dù chưa đủ 4 stack, dmg = 75% công thức × số stack/4) |
| **Plague Storm** | Poison + Shock | Poison **lan 5t** (toàn bộ stack, tối đa 3 mục tiêu mới); tiêu thụ Shock |
- `[STA-01]` **Boss:** thời gian status ×0.5; Freeze/Stun có DR (lần 2 = 50%, lần 3 miễn nhiễm 8s); Freeze **không** áp dụng với boss → thay bằng **Frostbite** (+15% dmg nhận, 3s). Chill tối đa −25% cho boss.
- `[STA-02]` Tối đa **6 status** đồng thời trên 1 mục tiêu (ưu tiên theo cường độ).
- `[STA-03]` Nguồn status: rune (§7.4), relic, class skill, hazard. Cơ hội áp = % proc của nguồn, roll bằng stream **combat**.
- `[STA-04]` **Kháng theo biome** (áp dụng ở `TargetResist`, số âm = yếu hơn): B1 Void +25%, Fire −15% · B2 Venom +60%, Fire −25% · B3 Frost +40%, Volt −20% · B4 Fire +60%, Frost −25% · B5 Void +40%, Volt −10%. Boss dùng kháng biome của nó, **tối đa +50%**.

---

## 6. Nhân vật (Class) — 4 class launch

Mỗi class: **HP**, **Q**, **E**, **Passive**, **3 Aspect** (mở bằng Mastery), 3 vũ khí (§7). Skill dùng `class.skillBase` (công thức `DMG-01`).
Trapper & Bonecaller (v1.0 cũ) → **v1.1** (§29).

| Class | HP | Armor | Tốc di chuyển | skillBase | Parry |
|---|---|---|---|---|---|
| **Ashblade** (Kiếm Sĩ Tro) | 100 | 0 | ×1.00 | 14 | Có (E) |
| **Shadow Archer** (Cung Thủ Bóng) | 80 | 0 | ×1.05 | 12 | Không |
| **Cinder Mage** (Pháp Sư Tàn Lửa) | 70 | 0 | ×1.00 | 14 | Không |
| **Ironwarden** (Hộ Vệ Thép) | 140 | 20 | ×0.92 | 14 | Có (E) |

Mở khóa: **cả 4 mở sẵn**. Mastery, Aspect, vũ khí 2–3 mở theo §6.5.

### 6.1 Ashblade — "đọc đòn, phản đòn"
| | Chi tiết (frame ở 60Hz) |
|---|---|
| **Q — Cinder Slash** | Cast **12f**, nón **120°**, r **3.5t**, **×2.0 Fire**, poise ×2, CD **8s**. Áp **Burn 1 stack** |
| **E — Ember Guard** | Thế thủ **72f (1.2s)**, di chuyển ×0.5. **f1–f9 = Parry:** hit đỏ/vàng trúng trong cửa sổ → hủy sát thương, địch **stun 1.5s**, **phản nổ r=2.5t ×1.5 Fire**, +10% Surge, **hoàn 50% CD**. **f10–72 = Guard:** hit đỏ/vàng giảm **70%**, không stun. **Tím không chặn được.** Recovery 10f. CD **12s** |
| **Passive — Tàn Lửa Bùng** | Gây **3 đòn trúng liên tiếp** mà không bị trúng đòn → **+15% sát thương 4s** (đòn trúng mới làm mới thời gian) |
| **Aspect 1 · Lửa Bám** (Mastery 4) | Cinder Slash áp **2 Burn**; CD +1s |
| **Aspect 2 · Gương Tro** (Mastery 8) | Cửa sổ Parry **14f** nhưng phản nổ ×1.0 |
| **Aspect 3 · Kiếm Liên** (Mastery 12) | Passive cần **2 đòn** và **+25%** dmg, nhưng Max HP **−10%** |

### 6.2 Shadow Archer — "giữ khoảng cách, hạ nhanh"
| | Chi tiết |
|---|---|
| **Q — Shadow Volley** | Cast **10f**, **5 mũi tên** quạt **60°** (cách 15°), mỗi mũi **×0.9**, xuyên 1, tầm 12t, CD **9s** |
| **E — Vanish Roll** | Lăn **3.5t / 12f**, **i-frame f2–f10**, sau đó **tàng hình 1.0s** (không bị nhắm mới; địch đang nhắm mất mục tiêu), phát bắn kế trong 1.0s **chắc chắn Crit**. **Không** tốn Dash charge. CD **10s** |
| **Passive — Săn Mồi** | **+30% sát thương** lên mục tiêu **cách >6t** |
| **Aspect 1 · Mưa Tên** (M4) | Volley = **7 mũi** quạt 90°, mỗi mũi ×0.7 |
| **Aspect 2 · Bóng Đêm** (M8) | Vanish **1.6s**, nhưng thay "chắc Crit" bằng **+50% Crit Damage** cho phát kế |
| **Aspect 3 · Thợ Săn** (M12) | Săn Mồi: ngưỡng **>4t**, bonus **+20%** |

### 6.3 Cinder Mage — "đại bác thủy tinh"
| | Chi tiết |
|---|---|
| **Q — Meteor** | Đặt vạch r=**3t** tại điểm nhắm (§AIM-04), **trễ 60f**, nổ **×3.0 Fire**, để lại **vùng cháy 3s** (Burn 1 stack/0.5s cho địch đứng trong), CD **12s**. **Heat +30** |
| **E — Frost Nova** | Cast **10f**, r=**4t** quanh người, **×1.0 Frost**, **2 Chill stack** mọi địch, đẩy lùi 1t, CD **10s**. **Heat −25** |
| **Passive — Cân Bằng Nhiệt** | Thanh **Heat 0–100**; giảm tự nhiên **5/s** (khi >0). **70–99 = Blaze:** +25% sát thương Fire. **=100 = Overheat:** **khóa mọi đòn đánh/skill 2.0s**, nhận **+20% sát thương**, rồi Heat về **40**. Đòn đánh thường: Heat +0 |
| **Aspect 1 · Sao Băng Kép** (M4) | Meteor nổ **2 lần** (trễ 20f, lệch 2t), mỗi lần ×2.0; CD +2s |
| **Aspect 2 · Băng Cực** (M8) | Frost Nova r=**5t**, **3 Chill stack** (đóng băng ngay), CD +3s, Heat −35 |
| **Aspect 3 · Nhiệt Kế Vỡ** (M12) | Ngưỡng Overheat **120**, Blaze **60–119**, nhưng Overheat khóa **3s** |

### 6.4 Ironwarden — "tường thành di động"
| | Chi tiết |
|---|---|
| **Q — Shield Bash** | Lao **5t / 14f**, **chống vỡ poise** suốt cú lao (super armor), trúng đầu tiên **stun 1.2s**, **×1.5**, CD **9s** |
| **E — Bulwark** | Giữ khiên **150f (2.5s)**, chặn **nón trước 150°**; hit đỏ/vàng từ phía trước = 0 dmg; **tím không chặn**. **f1–f9 = Parry** (như Ashblade: stun 1.5s, +10% Surge). Mỗi dmg bị chặn **tích** vào `stored`. Kết thúc (hết giờ hoặc bấm E lần nữa) → **sóng xung kích r=3t**, dmg = `min(stored × 1.5, 12 × skillBase × rankMult)`, đẩy lùi 2t. CD **14s** (tính từ lúc kết thúc) |
| **Passive — Da Thép** | **+20 Armor**; **miễn hất lùi** khi đang đánh (từ frame startup đến hết recovery) |
| **Aspect 1 · Mũi Khiên** (M4) | Bash lao **7t**, CD **7s**, stun giảm còn **0.8s** |
| **Aspect 2 · Thành Trì** (M8) | Bulwark **3.5s**, không thả sớm được, trần xung kích +**50%** |
| **Aspect 3 · Phản Giáp** (M12) | Armor passive **+35**, tốc di chuyển **−5%**; Bulwark **phản đạn** về phía kẻ bắn (×1.0 dmg đạn gốc) |

### 6.5 Mastery (gộp Class + Weapon Mastery của v1.0, D-14)
- `[CLS-01]` Mastery **1–20 mỗi class**. XP: **+1/phòng dọn · +20/boss · +50 khi thắng run · +100 lần thắng đầu**. Mốc lên cấp `n`: cần `50 + 25×n` XP (Lv10 = 1.875 XP ≈ 19 run → mở vũ khí Legendary; Lv20 = 6.250 XP ≈ 60 run của class đó).
- Phần thưởng (cố định): **Lv2/6/14/18** skin màu · **Lv3** mở vũ khí **Rare** · **Lv4/8/12** Aspect 1/2/3 · **Lv5/10/15/20** danh hiệu · **Lv10** mở vũ khí **Legendary** · **Lv1/5/9/13/17** perk **+2% ATK** (tổng +10%) · Lv7/11/16/19 một đoạn lore trong Codex.
- `[CLS-02]` Trần sức mạnh từ Mastery **+10% ATK**. Aspect chọn **1/run** ở màn chuẩn bị.

---

## 7. Vũ khí — 12 vũ khí

### 7.1 Quy ước vũ khí
- **frames** = `[startup, active, recovery]` ở AS 100%. Với AS=`a`: mỗi mảng chia `a`, làm tròn gần nhất, tối thiểu 1f. Chuỗi combo reset sau **30f** không nhấn tiếp.
- **Cận chiến**: vùng trúng = **hình quạt** (`arc`, `r`) tính từ tâm người chơi, **mỗi cú vung chỉ trúng mỗi địch 1 lần**; `r` đã gồm bán kính hurtbox địch (kiểm tra *tâm địch* trong `r + bán kính địch`).
- **Tầm xa**: đạn **hình tròn bán kính 3px**, tốc độ `speed` (t/s), trúng mỗi địch 1 lần/đạn, `pierce` = số địch xuyên thêm.
- `dmg` = `WeaponBase` ở Rank I. **Rank II–V: +12% mỗi rank** (cộng thẳng: Rank V = ×1.48).
- DPS khởi điểm (1 mục tiêu, 100% trúng, Rank I): cận chiến cơ bản/hiếm **35–39**; tầm xa **25–38** (Archer/Mage thấp hơn vì an toàn, skill bù lại); Legendary **40–50** (gồm cơ chế riêng). Kỳ vọng thực tế ≈ 75% do né/di chuyển — làm mốc cân bằng ở §26.

### 7.2 Bảng vũ khí
| ID | Tên | Class | Loại | Mở khóa | `dmg` | Combo (×) | Frames mỗi đòn | Hình/Tầm | Poise× |
|---|---|---|---|---|---|---|---|---|---|
| `wpn_ash_sword` | **Kiếm Tro** | Ashblade | Cận | Mặc định | 12 | 1.0 / 1.0 / 1.4 | [6,4,8] [6,4,8] [8,5,14] | quạt 100°, r 2.4t | 1.0 |
| `wpn_ash_dual` | **Song Đao Than** | Ashblade | Cận (Rare) | Mastery 3 | 7 | 1.0×3 / 1.6 | [4,3,5]×3, [5,4,9] | quạt 80°, r 2.0t | 0.7 |
| `wpn_ash_doom` | **Doomday Edge** | Ashblade | Cận (Legend) | Mastery 10 | 22 | 1.0 / 1.3 / 1.8 | [12,6,18] [14,8,24] [18,8,30] | quạt 140°, r 2.8t | 2.0 |
| `wpn_arc_bow` | **Cung Bóng** | Archer | Xa | Mặc định | 10 | 1.0 (lặp) | [8,1,13] (=22f/phát) | đạn 16 t/s, tầm 11t, pierce 0 | 0.5 |
| `wpn_arc_xbow` | **Nỏ Liên Châu** | Archer | Xa (Rare) | Mastery 3 | 13 | 3 bolt/burst | burst: bolt tại f0,6,12; **nạp 50f** (chu kỳ 62f) | 18 t/s, tầm 10t, pierce 1 | 0.6 |
| `wpn_arc_star` | **Sao Rơi** | Archer | Xa (Legend) | Mastery 10 | 11 | 1.0 (lặp) | [8,1,13] | như Bow; **tách 3 mũi** khi chạm tường/hết tầm | 0.5 |
| `wpn_mag_staff` | **Gậy Tro** | Mage | Xa | Mặc định | 11 | 1.0 (lặp) | [10,1,15] (=26f) | cầu 12 t/s, tầm 10t, **Fire** | 0.6 |
| `wpn_mag_tome` | **Sách Cháy** | Mage | Xa (Rare) | Mastery 3 | 4 | 3 tia/phát | [8,1,11] (=20f) | 3 tia quạt 45°, **homing 120°/s**, tầm 8t, **Fire** | 0.3 |
| `wpn_mag_meteor` | **Trượng Lưu Tinh** | Mage | Xa (Legend) | Mastery 10 | 12 | 1.0 (lặp) | [10,1,15] | như Staff + **đuôi lửa**; **phát thứ 4** = thiên thạch r=2t ×1.8 | 0.6 |
| `wpn_iron_mace` | **Chùy & Khiên** | Ironwarden | Cận | Mặc định | 18 | 1.0 / 1.5 | [10,5,16] [12,6,22] | quạt 90°, r 2.2t | 1.8 |
| `wpn_iron_spear` | **Giáo** | Ironwarden | Cận (Rare) | Mastery 3 | 14 | 1.0 / 1.0 / 1.5 | [8,3,12] [8,3,12] [10,4,18] | **đâm thẳng** dài 3.6t, rộng 0.9t, xuyên tất cả | 1.0 |
| `wpn_iron_bell` | **Chuông Tang** | Ironwarden | Cận (Legend) | Mastery 10 | 20 | 1.0 / 1.6 | [11,5,18] [13,6,24] | quạt 100°, r 2.4t | 2.0 |

### 7.3 Đòn nặng & cơ chế riêng (giữ **nút H 36f** rồi thả; thả sớm = huỷ)
| ID | Đòn nặng (×2.2 trừ khi ghi khác) | Cơ chế riêng |
|---|---|---|
| `wpn_ash_sword` | Chém xoay **360°**, r 2.6t, frames [10,6,18] | — |
| `wpn_ash_dual` | **Lao chém** 4t xuyên địch (i-frame f2–f8), frames [6,8,14] | Crit chắc chắn gây **Bleed 1 stack**; **+10% Crit** nội tại |
| `wpn_ash_doom` | **Đập đất** AoE r 3t, +50% poise, frames [18,6,28] | Đòn thứ **3**: sau 30f gọi **sao băng** r 2t ×1.2 Fire tại mục tiêu |
| `wpn_arc_bow` | Tích lực: mũi tên **xuyên vô hạn** theo đường thẳng, 24 t/s, **×2.6** | — |
| `wpn_arc_xbow` | **Quạt 5 bolt** ×1.2 mỗi bolt, tầm 7t | Chỉ nạp khi hết burst; bắn dở mà đổi hướng không mất bolt |
| `wpn_arc_star` | Như Bow | Tách: mỗi mũi con **50% dmg**, tầm 5t, **không tách tiếp** |
| `wpn_mag_staff` | Cầu nổ AoE r **2.5t** ×2.2 | — |
| `wpn_mag_tome` | **Trận Pháp** r 2.5t, 3s, tick 0.5s dmg ×1.5/tick (CD riêng 6s) | Tia homing ưu tiên mục tiêu gần *hướng nhắm* nhất |
| `wpn_mag_meteor` | Như Staff + đặt thiên thạch r 2t ×1.8 ngay | Bộ đếm "phát thứ 4" reset khi đổi phòng |
| `wpn_iron_mace` | **Shield Bash** ×2.2, **stun 0.8s** | Đòn cuối combo +knockback 1t |
| `wpn_iron_spear` | **Lao đâm** 5t xuyên, i-frame **không** | Đòn 3 quét **quạt 60°** r 3.6t |
| `wpn_iron_bell` | **Xả Âm:** sóng r 3.5t, dmg ×(2.2 + 0.5×Âm) rồi Âm=0 | **Âm** (tối đa 5): +1 mỗi **parry** hoặc **hit bị chặn bằng Bulwark** |

### 7.4 Nâng cấp & Rune
- `[WPN-01]` **Rank I → V** trong run: Whetstone (Shop 100, +20/lần mua) · Lửa Trại (**60 × Rank hiện tại** vàng: I→II 60, II→III 120, III→IV 180, IV→V 240; 1 lần/Rest) · Event Thợ Rèn Lạc.
- `[WPN-02]` **Bỏ** Weapon Mastery riêng (gộp §6.5).
- `[WPN-03]` **Enchant slot:** 1 slot, **slot 2 mở ở Rank IV**. Gắn **Rune** (Fire/Frost/Volt/Venom/Void; mua Shop 60–90 hoặc Event). Rune: đòn đánh của vũ khí **đổi nguyên tố** sang rune (đòn số lẻ dùng rune 1, số chẵn dùng rune 2 nếu có đủ 2), **+15% Elemental Bonus** nguyên tố đó, **15% proc** status tương ứng (Fire→Burn, Frost→Chill, Volt→Shock, Venom→Poison, Void→Void Mark) mỗi lần trúng. Vũ khí Fire sẵn (Mage) + rune Frost = đòn đổi sang Frost.
- `[WPN-04]` Mỗi run chọn **1 vũ khí chính**; **không swap** (D-07).
- `[WPN-05]` Hitbox/hurtbox cố định theo bảng; lệch hình học giữa render và hitbox **không được vượt 1px**.

---

## 8. Relic, Consumable, Curse, Synergy

### 8.1 Độ hiếm & số lượng (launch)
| Độ hiếm | Số relic | Max stack | Màu |
|---|---|---|---|
| Common | 20 | 3–4 (ghi từng relic) | Xám `#b8b8c0` |
| Uncommon | 18 | 3 | Xanh lá `#5fd16b` |
| Rare | 12 | 2 | Xanh dương `#4aa3ff` |
| Epic | 6 | 1 | Tím `#b84bff` |
| Legendary | 4 | 1 | Cam vàng `#ffb02e` |
| Evolved | 6 (§8.6) | 1 | Đỏ ngọc `#ff4d6d` |

### 8.2 Cấu trúc & luật relic
- `[REL-01]` Mỗi relic: `id, name, rarity, tags[], req?, trigger, effect, maxStack, unlock`. ID = `rel_<mã>` (vd `rel_c01`). `req` ∈ {`melee`,`ranged`}: relic **bị loại khỏi pool** nếu vũ khí đang dùng không khớp.
- `[REL-02]` **Nhặt trùng = tăng stack** (đến `maxStack`); hiệu ứng ghi `a/b/c` = giá trị ở stack 1/2/3. Relic đã max không xuất hiện lại (`LOOT-04`).
- `[REL-03]` **Trigger** (tên sự kiện trên event bus): `Passive · OnHit · OnCrit · OnKill · OnDash · OnParry (gồm Perfect Dodge) · OnSkill · OnHeavy · OnDamaged · OnRoomStart · OnRoomClear`.
- `[REL-04]` **Chống vòng lặp:** mọi sát thương/sự kiện do relic sinh ra mang `src.depth`; sát thương có `depth ≥ 1` **không kích OnHit/OnCrit**; `OnKill` chấp nhận `depth ≤ 2`; mỗi relic có **ICD 6f / mục tiêu** cho proc OnHit. Damage từ relic dùng `Raw` của đòn gốc (`snap`), **không crit** (trừ ghi rõ).
- `[REL-05]` Mở khóa: Common/Uncommon **mở sẵn**; Rare 6 relic mở sẵn, 6 relic mở **qua hành động** (§14.3); Epic/Legendary mở bằng hành động. Chưa mở = không vào pool, hiện `???` trong Codex.

### 8.3 Danh sách 60 relic (giá trị mỗi stack, `a/b/c`)
**Common (20)** — `Passive` nếu không ghi
| Mã | Tên | Tag | Hiệu ứng | Max |
|---|---|---|---|---|
| c01 | Nhẫn Tro | power | +8% ATK | 3 |
| c02 | Bùa Da Sắt | defense | +15 Armor | 3 |
| c03 | Giày Rách Gió | dash | +6% tốc di chuyển | 3 |
| c04 | Móng Vuốt Sói | crit | +5% Crit Chance | 4 |
| c05 | Túi Vàng Thủng | economy | +10% vàng nhận | 3 |
| c06 | Chai Lửa Nhỏ | vitality | Flask hồi thêm +3% Max HP | 3 |
| c07 | Mạch Sống | vitality | +12 Max HP (hồi 12 ngay) | 4 |
| c08 | Cung Gãy (`req:ranged`) | projectile | +10% dmg đạn | 3 |
| c09 | Lưỡi Mài (`req:melee`) | melee | +10% dmg cận chiến | 3 |
| c10 | Đá Lửa | fire | +10% Fire Bonus | 3 |
| c11 | Băng Vụn | frost | +10% Frost Bonus | 3 |
| c12 | Mảnh Sét | volt | +10% Volt Bonus | 3 |
| c13 | Bào Tử Khô | venom | +10% Venom Bonus | 3 |
| c14 | Mảnh Hư Không Nhỏ | void | +10% Void Bonus | 3 |
| c15 | Đồng Hồ Cát Nứt | skill | −6% CD skill | 3 |
| c16 | Gương Nhỏ | parry | +1f cửa sổ Parry/Perfect Dodge | 3 |
| c17 | Dây Xích Nhẹ | dash | −8% thời gian hồi Dash | 3 |
| c18 | Vòng Nổ | aoe | +12% bán kính AoE | 3 |
| c19 | Nam Châm Vàng | economy | +50% bán kính hút vàng | 2 |
| c20 | Khiên Gỗ | defense | Grace +6f (0.1s) | 2 |

**Uncommon (18)** — `a/b/c` theo stack
| Mã | Tên | Tag | Trigger → Hiệu ứng |
|---|---|---|---|
| u01 | Răng Độc | venom | OnHit **15/22/30%** gây Poison 1 stack |
| u02 | Lưỡi Lửa | fire, dash | OnDash: vệt lửa **2s** dọc đường dash, **30/40/50% Raw/s** (tick 0.5s) |
| u03 | Găng Sấm | volt | Mỗi **5 đòn trúng**: sét chuyền **60% Raw** qua **2/3/4** địch trong 4t |
| u04 | Mắt Kẻ Săn | crit, power | Đòn đầu tiên trúng 1 địch **đánh dấu** nó (1 mục tiêu tại 1 thời điểm, chuyển sang mục tiêu khác khi nó chết): mục tiêu nhận **+15/20/25%** dmg |
| u05 | Xương Hộ Vệ | defense | OnKill **10/15/20%** sinh *Bone Orb*: chặn **10** dmg, tối đa 3 orb, tồn tại 8s |
| u06 | Kim Cương Băng | frost | OnHit **12/18/25%** gây Chill 1 stack |
| u07 | Giọt Máu | crit, melee | OnCrit gây **Bleed 1/2/3 stack** |
| u08 | Hạt Giống Lửa | fire, aoe | OnKill **25/35/45%** địch phát nổ r=2t **80% Raw** Fire |
| u09 | Chiếc Còi Bạc | dash | OnDash: **+15/20/25% ATK** 2s (làm mới, không cộng) |
| u10 | Phản Xạ | parry | OnParry: thêm **+10/15/20 Surge** |
| u11 | Nhẫn Hút | vitality | OnKill hồi **1/2/3 HP**, tối đa **10/15/20 HP mỗi phòng** |
| u12 | Đèn Lồng Hư Không | void | OnHit **20/28/36%** gây Void Mark 1 stack |
| u13 | Cuộn Lệnh | skill | OnSkill: **+20/30/40% ATK** 4s |
| u14 | Đạn Xuyên (`req:ranged`) | projectile | Đạn xuyên thêm **+1/+2/+3** địch |
| u15 | Búa Vụn (`req:melee`) | melee, aoe | OnHeavy: sóng r=2.5t **50/70/90% Raw** |
| u16 | Khiên Phản | defense | OnDamaged: bắn **6 mảnh** tỏa tròn tầm 5t, mỗi mảnh **40/60/80% Raw** |
| u17 | Ống Hít Tro | economy | OnRoomClear: **+10/18/25 vàng** |
| u18 | Sợi Chỉ Số Phận | economy | **+8/+14/+20 Luck** |

**Rare (12)** — `a/b` theo stack (max 2)
| Mã | Tên | Tag | Hiệu ứng |
|---|---|---|---|
| r01 | Trái Tim Ngược | defense, power | Armor hiệu lực ×**0.5**, nhưng **+0.4/0.55% ATK mỗi 1 Armor gốc** (trước khi giảm) |
| r02 | Chuông Lặng | parry, dash | OnParry: đòn trúng kế trong 4s **+80/120%** dmg |
| r03 | Vòng Sương | frost | Địch Freeze **vỡ** (hết Freeze hoặc chết khi đang Freeze): nổ r=2t = **8/12% Max HP mục tiêu** (boss 2/3%), **trần 6× Raw** đòn cuối |
| r04 | Kim Đồng Hồ Vỡ | dash | Hồi Dash **−30/−40%**; dash xuyên qua địch gây **60/90% Raw** |
| r05 | Đồng Xu Đôi | economy | **20/30%** nhân đôi mỗi lần nhặt vàng; reroll Shop đầu tiên mỗi Shop **miễn phí** |
| r06 | Lò Than Sống | fire | Burn **tối đa +1 stack**, Burn dmg **+25/40%**, Overload **+50%** dmg |
| r07 | Mạng Nhện Sét | volt | Shock lan **50%** (thay 30%), **+2/+3 mục tiêu** (thay 2) |
| r08 | Bình Độc Đặc | venom | Poison tối đa **+5 stack**; địch chết đang Poison: lan **2/3 stack** cho tối đa 2/3 địch gần |
| r09 | Con Mắt Ám | void | Void Mark nổ ở **3 stack** (thay 4); nổ **+50/80%** dmg |
| r10 | Áo Choàng Gió | dash | OnDash: **+25/40% AS** 1.5s |
| r11 | Bia Đá Thề | defense | Đòn trúng **đầu tiên mỗi phòng** giảm **70/85%** |
| r12 | Hoa Tiêu Lò | skill | Skill **+40/60%** dmg; **mỗi lần cast thứ 3** reset CD của chính skill đó |

**Epic (6)**
| Mã | Tên | Tag | Hiệu ứng |
|---|---|---|---|
| e01 | Mặt Nạ Ba Mặt | power, defense, dash | Mỗi phòng xoay vòng: **Cuồng** (+30% ATK, nhận +15% dmg) → **Thủ** (+40 Armor, gây −10% dmg) → **Tốc** (+25% tốc di chuyển & AS) |
| e02 | Vương Miện Gai | defense, aoe | OnDamaged: nổ r=3t **200% Raw** (ICD 1s); **Max HP −15%** |
| e03 | Cối Xay Linh Hồn | skill, vitality | OnKill **+1 Soul**; **30 Soul** → thanh Surge đầy ngay, Soul về 0 |
| e04 | Đôi Cánh Sáp | dash | **+1 Dash charge** (tối đa 3); dash khi **đủ charge** → nổ r=2.5t **100% Raw** |
| e05 | Đỉnh Cao Băng Hỏa | fire, frost | Đòn Fire áp thêm **1 Chill**, đòn Frost áp thêm **1 Burn** (ICD 1s/mục tiêu); Steam bán kính **×2**, dmg **+50%** |
| e06 | Trái Tim Cháy Chậm | vitality, defense | Flask **+1 charge**; Flask hồi **45% trong 3s** (HoT); khi đang hồi **+20 Armor** |

**Legendary (4)**
| Mã | Tên | Tag | Hiệu ứng |
|---|---|---|---|
| l01 | Lõi Tro Vĩnh Cửu | vitality | **1 lần/run** khi HP về 0: hồi **50% HP**, bất tử 2s, nổ r=4t **300% Raw**. *(Vô hiệu ở Heat ≥19)* |
| l02 | Bàn Tay Vua Tro | fire, melee, power | Đòn **thứ 3** mỗi combo (tầm xa: mỗi **3 phát**) = đập lửa r=3t **300% Raw**; mọi hiệu ứng Fire **+50%** |
| l03 | Ngày Tận Thế Nhỏ | fire, aoe | Mỗi **60s trong chiến đấu**: **mưa sao băng 8s**, mỗi **0.5s** một thiên thạch r=1.5t **120% Raw** vào địch gần nhất |
| l04 | Trái Tim Hư Không *(mở khóa: hạ Người Mang Lửa Rỗng)* | void | Mọi sát thương thành **Void**; mỗi **2 đòn** thêm 1 Void Mark; Void nổ **×2**; **Max HP −25%** |

### 8.4 Rune
Rune nguyên tố (5 loại) là **vật phẩm gắn vũ khí**, không phải relic: xem **§7.4 `WPN-03`**.

### 8.5 Tag Resonance (thay "Bộ/Set" — D-15)
- `[RES-01]` Với mỗi **tag**, đếm số **relic khác nhau** sở hữu có tag đó (stack không tính thêm; Evolved = hợp tag của 2 nguyên liệu). Đạt **≥3** → thưởng A; **≥5** → thưởng B (cộng dồn A+B).
- `[RES-02]` UI: ngưỡng hiện ở màn Relic dưới dạng thanh nhỏ ○○○●● cho từng tag đang có ≥1.
| Tag | ≥3 (A) | ≥5 (B) |
|---|---|---|
| fire | +15% dmg Fire | Burn tối đa +1 stack |
| frost | Chill: −5% tốc thêm/stack | Freeze +0.5s |
| volt | Shock lan +1 mục tiêu | Lan 45% |
| venom | +15% dmg Poison | Poison tối đa +5 stack |
| void | Detonation +25% | Đòn Crit thêm +1 Void Mark |
| crit | +10% Crit Damage | +8% Crit Chance |
| dash | −10% hồi Dash | I-frame dash +2f |
| parry | Cửa sổ Parry +2f | Parry/Perfect Dodge +10 Surge |
| defense | +20 Armor | Grace +9f |
| economy | +15% vàng, Shop −10% giá | +1 slot relic trong Shop |
| projectile | +15% dmg đạn | +1 xuyên |
| melee | +10% dmg & +10% tầm cận chiến | +15% dmg poise |
| aoe | +15% bán kính AoE | +20% dmg AoE |
| power | +8% ATK | ΠATK_more ×1.10 |
| vitality | +15 Max HP | Flask +1 charge |
| skill | −10% CD skill | Skill ×1.15 dmg |

### 8.6 Relic Evolution (ghép 2 → 1)
- `[EVO-01]` Tại **Rest** (Lửa Trại): nếu sở hữu **cả hai nguyên liệu (bất kỳ stack)** và **đã học công thức** (50 Tàn Hồn/công thức ở Odessa — Hub) → nút **Tiến Hóa**: tiêu thụ **toàn bộ stack** của hai nguyên liệu, nhận **Evolved** (stack 1). Không tiến hóa ở Shop/Event.
| Evolved | Nguyên liệu | Hiệu ứng |
|---|---|---|
| **Lưỡi Hơi Nước** `ev1` | u02 + r03 | Vệt dash gây **Burn + Chill** mỗi 0.5s → kích **Steam** (80% ATK, Blind); vệt kéo dài 3s |
| **Nanh Bão Độc** `ev2` | u01 + u03 | Poison và Shock tự động kích **Plague Storm**; sét chuyền lan Poison |
| **Hộ Vệ Vang** `ev3` | u05 + r02 | Bone Orb khi hấp thụ **nổ r=2t 150% Raw**; Perfect Dodge sinh 2 orb |
| **Con Mắt Thời Gian** `ev4` | u04 + r04 | Mục tiêu bị đánh dấu **−30% tốc**; giết mục tiêu đó **hồi đầy Dash** |
| **Vương Miện Ngược** `ev5` | e02 + r01 | Nổ gai **+1% dmg mỗi Armor**; **bỏ** hình phạt Max HP −15% |
| **Ngân Hàng Ma** `ev6` | r05 + c05 | **+1% ATK mỗi 50 vàng đang giữ** (tối đa +30%); mỗi phòng dọn: +5% vàng đang giữ (tối đa +20) |

### 8.7 Consumable (10 loại; **2 slot** gốc, Cây Tàn Lửa tới **4**)
`[CON-01]` Dùng = chạm nút; hiệu lực tức thì; **tiêu thụ 1 lần**; cooldown chung 0.5s. Sát thương consumable `= 35 × 1.45^(Biome−1)` (không ăn ATK%). Giá Shop 25–70.
| Mã | Tên | Hiệu ứng | Giá |
|---|---|---|---|
| bomb | Bom Tro | Ném 6t, nổ r=2.5t **Fire** | 35 |
| smoke | Khói Mù | Mây r=3t **6s**: địch trong mây **Blind**; người chơi trong mây **không bị nhắm xa** | 30 |
| tele | Cuộn Dịch Chuyển | Dịch chuyển **8t** theo `facing`, bất tử 20f | 40 |
| lure | Mồi Nhử | Mồi **6s**: địch thường chuyển mục tiêu sang mồi (boss bỏ qua) | 30 |
| mirror | Mảnh Gương | **6s** phản **3 đạn** địch (×1.0) | 45 |
| tonic | Thuốc Bổ | Hồi **30% Max HP** trong 3s | 35 |
| ward | Kết Giới | **Barrier = 25% Max HP**, 8s | 40 |
| feather | Lông Phượng | **Tự kích khi chết**: hồi 25% HP + bất tử 2s *(vô hiệu ở Heat ≥19)* | 70 |
| adren | Bình Adrenalin | **+30% AS & tốc di chuyển** 8s | 40 |
| frostvial | Lọ Băng | r=3t: **3 Chill** (đóng băng; boss: Frostbite) | 45 |

### 8.8 Curse & Blessing
**Curse (8)** — mỗi curse là *1 dòng* trong danh sách; nhiều curse cộng dồn; **không cùng loại 2 lần**:
`Yếu Ớt` −15% Max HP · `Chậm Chạp` −10% tốc di chuyển · `Giòn Giáp` −20 Armor · `Nghèo Túng` −25% vàng nhận · `Cạn Lửa` Flask −1 charge tối đa · `Nặng Nề` Hồi Dash +25% · `Địch Hăng Say` địch +10% tốc di chuyển · `Lì Lợm` địch +15% HP.
- Gỡ curse: Shrine **Thanh Tẩy** · **Rest → Thanh Tẩy** (50 vàng/curse) · Hồ Nước Tro (Event).
**Blessing (5, kéo dài 3 phòng)**: `Sức Mạnh` +15% ATK · `Kiên Cố` +30 Armor · `Nhanh Nhẹn` +10% tốc di chuyển · `Phú Quý` +25% vàng · `May Mắn` +10 Luck. Blessing mới cùng loại **làm mới** thời gian.

---

## 9. Kẻ thù

### 9.1 Nguyên mẫu hành vi (số **quy về Biome 1**; xem scale ở §9.3)
| Archetype | HP | DMG | Tốc (t/s) | Poise | Armor | Bán kính | Threat | Hành vi chung |
|---|---|---|---|---|---|---|---|---|
| Grunt | 30 | 10 | 3.2 | 20 | 0 | 6px | 2 | Áp sát, đánh cận |
| Archer | 22 | 8 | 2.6 | 12 | 0 | 5px | 3 | Giữ **5–8t**, lùi nếu người chơi <4t |
| Rusher | 34 | 12 | 2.8 (lao 7.5) | 24 | 0 | 6px | 3 | Nhắm → lao thẳng, đâm tường = choáng 1.5s |
| Swarm | 10 | 5 | 4.0 | 0 | 0 | 4px | 1/con (đàn 4–5) | Bay vòng, đánh thành đàn |
| Caster | 28 | 10 | 2.4 | 14 | 0 | 6px | 5 | Giữ xa, thi triển vùng/triệu hồi; **bỏ chạy** khi <4t |
| Support | 26 | 6 | 2.2 | 14 | 0 | 6px | 4 | Buff/heal đồng minh, **ưu tiên diệt** |
| Shielded | 50 | 14 | 2.4 | 60 | 20 | 7px | 5 | **Khiên trước 180°** chặn 100%; **Heavy/Skill từ phía trước chỉ còn 50%** |
| Bomber | 18 | 25 | 3.6 | 8 | 0 | 5px | 4 | Chạy tới, **fuse** rồi nổ; chết trước fuse = không nổ |
| Ambusher | 30 | 14 | 3.0 | 16 | 0 | 6px | 4 | Ẩn/trồi bất ngờ (luôn có telegraph) |
| Tank | 120 | 20 | 1.8 | 150 | 40 | 10px | 8 | Chậm, đòn nặng, vùng rộng |
| Elite | 160 | 16 | 3.0 | 100 | 25 | 9px | 13 | Combo + đòn đặc trưng + affix (§9.4) |

### 9.2 Danh sách 40 kẻ địch (7 thường + 1 elite × 5 biome)
Cú pháp đòn: `hình · tele/act/rec (frame) · dmg× · màu`. `dmg× × DMG_base × scale` (§9.3). Đạn địch mặc định **7 t/s** (Heat 7: ×1.15). Màu: Đ=đỏ, V=vàng(parry), T=tím(phải né). Mọi tele ≥ `TEL-01`.

**B1 · Nghĩa Địa Tro**
| ID | Tên | Archetype | Đặc điểm & đòn |
|---|---|---|---|
| `skel_grunt` | Lính Xương | Grunt | **Chém 2 nhịp:** quạt 90° r1.6t · 30/7/18 ×1.0 **Đ** → ngay sau 24/7/24 ×1.0 **V** |
| `skel_archer` | Cung Thủ Xương | Archer | Bắn 1 mũi: đường mảnh · 36/1/72 ×1.0 **Đ** (đạn thường) |
| `ghoul` | Ghoul | Rusher | **Lao** thẳng dài 7t, rộng 1t · 36/(7.5t/s)/48 ×1.0 **Đ**; đâm tường: choáng 1.5s, nhận +20% dmg |
| `ash_bat` | Dơi Tro | Swarm | Bay zigzag; **cắn:** vòng r1t quanh mục tiêu · 24/4/30 ×0.5 **Đ**; luôn sinh theo **đàn 4** |
| `curse_priest` | Tư Tế Nguyền | Support | **Hồi** 20% Max HP cho đồng minh HP% thấp nhất trong 8t · cast 60f (vòng xanh) · CD 240f; không có ai để hồi → bắn đạn nguyền chậm (5 t/s) 36/1/90 ×0.6 **Đ** |
| `gravekeeper` | Hộ Mộ | Shielded | **Đập** quạt 100° r2.0t · 36/8/36 ×1.3 **Đ**; khiên trước (xem 9.1) |
| `grave_digger` | Kẻ Đào Mộ | Caster | **Triệu hồi 2 Lính Xương** (miễn threat) · 60/—/40 (đất sáng **T**) · CD 600f · tối đa 4 minion sống |
| `ash_knight` | **Hiệp Sĩ Tro** (Elite) | Elite | **Combo 4:** quạt 100° r2.2t · tele 36 rồi 18/nhịp · ×1.0,×1.0,×1.0,×1.5 (nhịp 4 **V**); **Xung kích:** lao 6t · 42/15/40 ×1.5 **T** · CD 360f |

**B2 · Rừng Nấm Độc**
| ID | Tên | Archetype | Đặc điểm & đòn |
|---|---|---|---|
| `shroomlet` | Nấm Con | Swarm | Lao cắn như Dơi Tro (24/4/30 ×0.5 **Đ**); chết để lại **vũng độc nhỏ r0.8t, 3s** |
| `spore_shooter` | Nấm Bắn | Archer | **Cối bào tử:** vòng r1t tại **vị trí người chơi lúc bắn** · 48/—/72 · rơi → **vũng độc 4s** ×0.4/0.5s **Đ** |
| `root_hunter` | Thợ Săn Rễ | Ambusher | Chui đất 2s (không nhắm được), **trồi dưới chân:** vòng r1.2t · 42/6/40 ×1.2 **T** · CD 300f |
| `worm_roller` | Sâu Cuốn | Rusher | Cuộn lao 6t, **nảy tường 1 lần** · 36/(7 t/s)/48 ×1.0 **Đ**; nảy tường: để vũng độc nhỏ |
| `shroom_witch` | Mụ Phù Thủy Nấm | Caster | **Gieo 3 vũng độc** r1.4t quanh người chơi · 54/—/50 **Đ**, vũng tồn tại 5s · CD 480f |
| `giant_shroom` | Nấm Khổng Lồ | Tank | **Đập** quạt 120° r2.4t · 42/8/48 ×1.4 **Đ**; **Phun bào tử** vòng nở r3t · 48/10/60 ×0.8 **T** · CD 420f |
| `spore_bomber` | Nấm Nổ | Bomber | Áp sát ≤1.5t → **fuse 60f** (vòng đỏ r2t lấp dần) rồi nổ **×2.5 Đ** |
| `mushroom_king` | **Vua Mũ Nấm** (Elite) | Elite | **Bão bào tử:** 8 hướng ×3 đợt cách 24f · 42/—/60 ×0.8 **Đ**; **Dập mũ** quạt 140° r2.8t · 42/10/50 ×1.6 **Đ**; ở **50% HP** (1 lần) triệu **3 Nấm Con** |

**B3 · Thành Chìm** *(vùng nước: địch/người chơi di chuyển bình thường; Volt trong nước +20% dmg cả hai bên)*
| ID | Tên | Archetype | Đặc điểm & đòn |
|---|---|---|---|
| `drowned_grunt` | Lính Chìm | Grunt | **Chém ngang** quạt 100° r1.8t · 30/7/22 ×1.1 **Đ**, đẩy lùi 1t |
| `eel` | Cá Điện | Rusher | **Lao** 7t · 36/(7.5 t/s)/48 ×1.0 **Đ**, để **vệt điện 2s** (×0.3/0.5s); trong nước tốc ×1.3 |
| `water_archer` | Xạ Thủ Nước | Archer | Tia nước (đạn 8 t/s) · 36/1/72 ×0.9 **Đ**, **đẩy lùi 1t** |
| `crab` | Cua Giáp | Shielded | **Kẹp** quạt 90° r1.8t · 36/8/40 ×1.3 **Đ**; khiên trước; kháng **Frost +40%** |
| `siren` | Hải Yêu | Caster | **Vùng chậm** r3t 4s (người chơi −30% tốc) · 54/—/50 **T**; đạn nước ×0.8 36/1/80 **Đ**; CD 480f |
| `jellyfish` | Sứa Bay | Swarm | Bay chậm 2.5 t/s; **lao chạm** · 24/6/40 ×0.5 **Đ** + **Shock 1s**; đàn 4 |
| `drowner` | Kẻ Nhấn Chìm | Ambusher | Ẩn trong nước; **nhảy vồ** 5t · 42/8/44 ×1.2 **T** (chỉ khi người chơi gần tile nước ≤5t) |
| `sunken_knight` | **Kỵ Sĩ Ngập** (Elite) | Elite | **Đâm giáo** dài 5t rộng 1t · 42/6/44 ×1.5 **Đ**; **Dậm** sóng nở r4t (6 t/s) · 48/—/60 ×1.0 **T** |

**B4 · Lò Rèn Rực Lửa**
| ID | Tên | Archetype | Đặc điểm & đòn |
|---|---|---|---|
| `apprentice` | Thợ Học Việc | Grunt | **Búa dọc** quạt 80° r1.8t · 30/7/24 ×1.1 **Đ** |
| `coal_golem` | Golem Than | Tank | **Đập đất** vòng r2.5t · 42/8/50 ×1.5 **Đ**; **Ném đá lửa** r1.2t tại người chơi · 48/—/70 ×1.0 **Đ** |
| `furnace_drone` | Lò Bay | Caster | Bay qua đầu người chơi **thả 3 bom lửa** (r1.5t, nổ sau 60f) · 48/—/60 **Đ**; CD 420f |
| `steam_gunner` | Súng Hơi | Archer | **3 viên quạt 20°** (đạn 8 t/s) · 36/1/90 ×0.8/viên **Đ** |
| `hammer_bot` | Búa Máy | Rusher | **Lao** 6t rồi **đập** r1.8t cuối đường · 36/(7 t/s)/60 ×1.0, pha đập ×1.4 **V** |
| `welder` | Thợ Hàn | Support | **Barrier** = 15% Max HP cho 1 đồng minh, 5s · cast 54f · CD 360f; tự vệ: tia hàn 36/1/80 ×0.8 **Đ** |
| `heat_bomb` | Bom Nung | Bomber | Fuse **54f** → nổ r2.2t **×2.5 Đ** + vũng dung nham 3s |
| `foreman` | **Cai Thợ** (Elite) | Elite | **Đe rơi** 3 điểm r1.8t · 48/10/60 ×1.4 **T**; **Búa quét** quạt 160° r3t · 42/10/50 ×1.6 **Đ**; ở 50% HP gọi **1 Golem Than** |

**B5 · Thánh Đường Lặng**
| ID | Tên | Archetype | Đặc điểm & đòn |
|---|---|---|---|
| `mute_monk` | Tu Sĩ Câm | Grunt | **Chém sáng** quạt 90° r2.0t · 30/7/20 ×1.0 **Đ** |
| `broken_angel` | Thiên Thần Gãy | Rusher | **Bay lao** 8t (qua hazard) · 36/(8 t/s)/50 ×1.2 **Đ** |
| `bell_singer` | Ca Sĩ Chuông | Caster | **Sóng chuông** nở r5t (6 t/s) · 48/—/60 ×0.9 **T**; CD 420f |
| `holy_knight` | Kỵ Sĩ Thánh | Shielded | Kiếm sáng quạt 100° r2.2t · 36/8/40 ×1.4 **Đ**; khiên trước **phản đạn** |
| `light_archer` | Cung Ánh Sáng | Archer | **Tia** dài 12t, rộng 0.6t, **khoá hướng 24f trước khi bắn** · 48/4/90 ×1.2 **Đ**, xuyên |
| `warden` | Hộ Pháp | Tank | **Đập chuông** r3t · 42/8/56 ×1.6 **Đ**; **Giáng thánh** 3 cột r1.2t theo chân người chơi · 42/6/70 ×1.2 **T** |
| `moth` | Thiêu Thân | Bomber | Bay lao, fuse **48f**, nổ r2t **×2.5 Đ** |
| `judge` | **Thẩm Phán** (Elite) | Elite | **Bản án:** vòng sáng r5t quanh người chơi thu hẹp · 60/—/70 ×1.5 **T**; **Tia** ×1.8 · 48/4/60 **Đ**; ở 50% HP gọi **2 Tu Sĩ Câm** |

### 9.3 Scale sức mạnh *(sửa `ENM-01`, xem 00.1 #8)*
```
[ENM-01] HP_enemy   = HP_base  × 1.45^(Biome−1)                  → ×1.00 / 1.45 / 2.10 / 3.05 / 4.42
[ENM-02] DMG_enemy  = DMG_base × (1 + 0.22 × (Biome−1))           → ×1.00 / 1.22 / 1.44 / 1.66 / 1.88
[ENM-03] Armor, Poise, tốc độ: KHÔNG scale theo biome.
[ENM-04] Heat áp thêm theo §15; Hòa Bình/Khó nhân sau cùng.
```
Mốc kiểm tra: Lính Xương HP 30 / dmg 10 (B1) → B5: 133 HP / 18.8 dmg. Boss không dùng scale này (§10).

### 9.4 Elite Affix (10)
| Affix | Hiệu ứng chính xác |
|---|---|
| Swift | +35% tốc di chuyển (không đổi thời gian telegraph) |
| Armored | +50% Armor (nếu Armor gốc = 0 thì **+30**) |
| Vampiric | Hồi **30%** sát thương gây ra |
| Volatile | Chết → vùng đỏ r2t tele 24f → nổ **×2.0** |
| Splitting | Ở 50% HP tách thành **2 bản 40% Max HP** (không tách tiếp) |
| Shielded | Barrier = **40% Max HP** khi vào phòng |
| Frenzied | HP <50%: **cooldown đòn −40%** (telegraph giữ nguyên) |
| Teleporting | Mỗi **6s** chớp (30f flash) rồi dịch chuyển **5t** ra sau lưng người chơi |
| Reflective | Phản đạn người chơi bay vào trước mặt **50% dmg** |
| Summoner | Mỗi **12s** triệu 2 Grunt của biome (miễn threat, tối đa 4) |
- `[ELT-01]` Số affix = `(Biome ≥ 3 ? 2 : 1) × (Heat ≥ 11 ? 2 : 1)`, tối đa **4**, không trùng. Cặp cấm: Volatile+Splitting. Elite hiện affix bằng **icon trên thanh HP**.

### 9.5 AI & Kỹ thuật
- State machine: `Idle → Alert (12f phản ứng) → Chase/Reposition → Telegraph → Attack → Recover → (Stagger/Dead)`.
- `[AI-01]` **Token đánh:** tối đa **3** kẻ địch ở trạng thái Telegraph/Attack cùng lúc (Swarm cùng đàn dùng chung **1 token**; Support/Caster hồi/triệu hồi không tốn token). Không có token → `Reposition` (giữ vòng quanh 3–6t).
- `[AI-02]` Di chuyển: có **tầm nhìn thẳng** (raycast lưới) → đi thẳng; không → **flow field** (BFS từ ô người chơi, cập nhật mỗi 6 tick nếu người chơi đổi ô). Không dùng A* từng-địch.
- `[AI-03]` **Separation steering** bán kính 1t; né vùng AoE telegraph đồng minh.
- `[AI-04]` Aggro khi trong 9t + có LOS, hoặc nghe được dash/skill (12t). Phòng chiến đấu: **mọi địch aggro ngay khi spawn xong**.
- `[AI-05]` **Ngân sách CPU:** AI toàn bộ ≤ **1.5 ms/frame** (24 địch). Địch xa >14t cập nhật AI **mỗi 3 tick**.
- `[AI-06]` Knockback bị chặn bởi tường; địch không bị đẩy ra ngoài phòng.
- `[TEL-09]` **Chuỗi đòn:** tele nhịp **đầu** theo `TEL-01`. Nhịp sau trong cùng chuỗi: **≥18f** nếu là đòn **cận chiến quanh thân** (quạt/vòng tâm là kẻ đánh); **≥30f** nếu là vùng **trên sàn tại vị trí mới** (người chơi phải chạy đi chỗ khác). Luôn có **dấu hiệu trực quan nhịp kế** (flash).

### 9.6 Ngân sách đe dọa (Threat Budget — tính lại cho 7 layer)
```
[THR-01] Budget = (6 + 2×Layer) × (1 + 0.5×(Biome−1)) × (1 + 0.04×Heat)      // Layer = 1..5 cho phòng chiến đấu/elite
[THR-02] Combat nhỏ (30×14): 2 wave (55%/45%). Combat lớn (40×21): 3 wave (40%/35%/25%). Elite: 1 elite + escort = 50% Budget, 2 wave
[THR-03] Threat: Swarm 1/con · Grunt 2 · Archer 3 · Rusher 3 · Bomber 4 · Ambusher 4 · Support 4 · Shielded 5 · Caster 5 · Tank 8 · Elite 13
[THR-04] Mỗi wave: tối đa 2 Caster/Support, 1 Tank, 1 đàn Swarm; chỉ dùng kẻ địch của biome hiện tại; ≥1 Grunt/Shielded làm "tiền tuyến"
[THR-05] Heat 9 (+1 wave): wave cuối chia đều ra thêm 1 wave.
[WAVE-01] Wave kế sinh khi địch sống wave hiện tại ≤ 25% (làm tròn lên) hoặc sau 20s.
[WAVE-02] Tối đa **24 địch sống** cùng lúc; vượt → hoãn spawn. Vị trí spawn: ≥6t từ người chơi và cửa; hiệu ứng "cổng tro" 36f (chưa nhắm được, chưa gây dmg).
```
Ví dụ: B1·L3 (Budget = 6+2×3 = 12, Heat 0): wave 1 = 55% = 6.6 → 1 Grunt (2) + 1 Archer (3) = 5 (dư 1.6 < chi phí nhỏ nhất → bỏ); wave 2 = 45% = 5.4 → 1 Rusher (3) + 1 Grunt (2) = 5. Cách chọn: **tham lam** — bốc ngẫu nhiên (stream gen) theo trọng số archetype của biome, bỏ loại không đủ ngân sách, dừng khi không còn loại nào đủ.

---

## 10. Boss

### 10.1 Khung chung
- Mỗi boss: **3 phase** (chuyển ở **66% / 33% HP**), arena riêng 40×22t, **1 "Mẫu Heat"** (kích hoạt từ Heat 8). Vua Tro: **4 phase** (75/50/25). Hư Không: 3 phase.
- `[BSS-01]` **Phase đổi = Break:** boss khựng **2s**, nhận **+30% dmg**, **hồi 3% Max HP**, xoá mọi hazard đang tồn tại; không chết-lại hồi thêm.
- `[BSS-02]` Kill = rương **3 lựa chọn (≥Rare)** + Soul Ember (+40) + mở khóa kế. Boss lần đầu: +150 Soul Ember (FirstClear, xem §12.3).
- `[BSS-03]` Boss Gương: tối đa 4 relic sao chép; loại relic vòng lặp (§10.8).
- `[BSS-04]` Thanh HP boss hiển thị lớn, **vạch phase** trên thanh.
- `[BSS-05]` **AI chọn đòn:** trọng số theo `weight`; loại đòn vừa dùng; không quá 2 đòn cùng *nhóm* liên tiếp; nhân ×2 trọng số đòn cận khi `dist<4t`, đòn xa khi `dist>6t`. **Gap** giữa đòn: P1 **40f**, P2 **28f**, P3 **18f**. Pool phase sau = pool phase trước + đòn mới.
- `[BSS-06]` Intro 90f (bất tử, thẻ tên). **Heat 16 = Phase +1 "Cuồng Nộ"** ở 15% HP: gap ×0.7 (tối thiểu 12f), mở toàn bộ đòn Heat-8; không thêm đòn mới.
- `[BSS-07]` Boss: **Armor 30**, kháng biome (`STA-04`, tối đa +50%), HP **không** scale `ENM-01` nhưng **+10% HP mỗi Heat 1** (chung Heat). Dmg đòn = `bossDmg × dmg× × heatMult`.
- `[BSS-08]` Mọi đòn lớn ≥ **48f** tele (`TEL-01`); chuỗi theo `TEL-09`.

| Boss | HP | bossDmg | Arena đặc biệt |
|---|---|---|---|
| Gorrak | 2.000 | 16 | 6 cột đá (HP 120, đập vỡ được, chặn đạn) |
| Mycelia | 4.200 | 18 | Thảm nấm, vũng độc |
| Vael | 7.000 | 20 | Mực nước (§B3) |
| Ignar | 12.000 | 22 | 3 ống dẫn nhiệt |
| Seraphine | 17.500 | 24 | Gương, chuông |
| Vua Tro | 28.000 | 28 | Thu hẹp ở P3 |
| Người Mang Lửa Rỗng | 20.000 | 24 | Trọng lực luân phiên |

### 10.2 B1 — Gorrak, Xương Vương *(Điểm dạy: né dash, telegraph Đ/V, dùng cột)*
| Đòn | Phase | Tele(f) | Hành vi | dmg× | Màu | W |
|---|---|---|---|---|---|---|
| `g_slash3` Chém 3 nhịp | 1+ | 48, 18, 18 | Quạt 100° r2.4t ×3; **nhịp 3 = V** | 1.0/1.0/1.4 | Đ,Đ,V | 3 |
| `g_slam` Đập nền | 1+ | 54 | Sóng nở từ boss 7 t/s, dày 0.8t, tới r12t | 1.2 | T | 2 |
| `g_charge` Lao thẳng | 1+ | 48 | Dài tới tường, rộng 1.5t, 14 t/s; **đâm cột = tự choáng 2s (+30% dmg), cột vỡ** | 1.5 | Đ | 2 |
| `g_ring` Vòng xương | 2+ | 48 | 8 quả cầu xương quay quanh boss r5t trong 4s (60°/s) rồi bắn ra | 0.8 | Đ | 2 |
| `g_wall` Tường xương | 2+ | 36 | 3 tường 2t×0.5t trồi 3s (chắn tầm nhìn; trồi dưới chân = đẩy) | 0.6 | Đ | 1 |
| `g_dbl` Sóng đôi | 2+ | 48 | 2 sóng nền cách 36f | 1.2 | T | 2 |
| `g_combo5` Combo 5 | 3 | 48, 20×4 | Quạt 100° r2.4t; nhịp 5 = **V** | 1.0×4, 1.6 | Đ…V | 3 |
| `g_triple` Đập 3 điểm | 3 | 48, 36, 36 | 3 vòng r2.2t liên tiếp tại vị trí người chơi | 1.3 | T | 2 |
| `g_rain` *(Heat 8)* Mưa xương | Heat | 36 | 10 mảnh r1t rơi ngẫu nhiên trong 3s | 0.8 | Đ | 1 |

### 10.3 B2 — Mycelia, Mẹ Nấm *(Điểm dạy: ưu tiên mục tiêu, quản lý Poison, kiểm soát không gian)*
| Đòn | Phase | Tele(f) | Hành vi | dmg× | Màu | W |
|---|---|---|---|---|---|---|
| `m_ring` Bào tử vòng | 1+ | 48 | 12 bào tử tỏa tròn 5 t/s | 0.8 | Đ | 3 |
| `m_vines` Dây leo trồi | 1+ | 48, 36×4 | 5 điểm r1t tại chân người chơi, mỗi 20f | 1.1 | T | 3 |
| `m_pool` Vũng độc lan | 1+ | 48 | 3 vũng r2t nở +0.2t/s trong 8s; tick ×0.5/0.5s + Poison | 0.5 | Đ | 2 |
| **P2:** Mycelia **bất tử + tách 3 "Thân Phụ"** (HP 600 mỗi cái, dùng `m_ring`/`m_vines` mỗi 4s); diệt cả 3 → Break | 2 | — | — | — | — | — |
| `m_pulse` Nổ nhịp | 3 | 48, 36×3 | 4 xung r6t theo nhịp 36f | 1.2 | T | 3 |
| `m_forest` Rừng dây leo | 3 | 60 | Chia arena 6 phần; 4 phần ngẫu nhiên bị dây leo đóng, chừa 2 phần an toàn | 1.5 | T | 2 |
| `m_ring2` *(Heat 8)* Bào tử chín | Heat | 48 | `m_ring` 2 vòng lệch 15° cách 24f | 0.8 | Đ | 1 |

### 10.4 B3 — Vael, Kỵ Sĩ Chìm *(Điểm dạy: đọc môi trường, Frost/Volt reaction)*
**Mực nước:** **Cao** = Volt +40% (cả 2 bên), tốc người chơi −10%. **Thấp** = lộ **gai sàn** (12 dmg, tele 36f, theo mẫu cố định). P1 = Thấp · P2 = Cao · P3 = **luân phiên mỗi 10s** (cảnh báo 2s).
| Đòn | Phase | Tele(f) | Hành vi | dmg× | Màu | W |
|---|---|---|---|---|---|---|
| `v_trident` Ném đinh ba | 1+ | 48 | Đạn 12 t/s, xuyên, đường mảnh | 1.3 | Đ | 3 |
| `v_slash` Chém nước | 1+ | 48 | Quạt 120° r3t + sóng bay 8t | 1.2 | Đ | 3 |
| `v_tsunami` Sóng thần | 2+ | 60 | Từ 1 cạnh tràn sang, 6 t/s, **chừa khe 3t** (mũi tên chỉ cạnh) | 1.5 | T | 2 |
| `v_current` Dòng chảy | 2+ | 48 | 5s đẩy 3 t/s về 1 tường (không dmg, kết hợp đòn khác) | 0 | — | 1 |
| `v_ghost` Kỵ sĩ ma | 3 | 60 | Triệu 2 Lính Chìm (60% HP, tối đa 2) | — | T | 1 |
| `v_spin` Chém xoay | 3 | 48, 20 | Vòng r4t quanh boss, 2 lần | 1.4 | Đ | 3 |
| `v_trident3` *(Heat 8)* | Heat | 48 | Quạt 3 đinh ba ±20° | 1.0 | Đ | 1 |

### 10.5 B4 — Ignar, Thợ Rèn Vô Tận *(Điểm dạy: ưu tiên phá ống vs né)*
**Ống dẫn nhiệt:** 3 ống ở mép arena (HP 400 mỗi ống), mỗi ống **phun lửa định kỳ** (tele 48f, tím, ×0.8). Phá 1 ống → Ignar **Quá Nhiệt: choáng 4s + nhận +50% dmg** (bỏ qua DR stun boss). Ống hồi sinh khi sang phase.
| Đòn | Phase | Tele(f) | Hành vi | dmg× | Màu | W |
|---|---|---|---|---|---|---|
| `i_press` Búa ép | 1+ | 54 | Vòng r2.5t tại người chơi | 1.5 | Đ | 3 |
| `i_lava` Dung nham lan | 1+ | 48 | 3 vệt 8t lan từ boss, tồn tại 4s (hazard chạm = ×1.0, ICD 0.5s) | 1.0 | T | 2 |
| `i_conv` Băng chuyền | 1+ | 48 | 6s băng chuyền đẩy người chơi 3 t/s (mũi tên chỉ hướng) | 0 | — | 1 |
| `i_golem` Golem | 2+ | 60 | Triệu 2 Golem Than (60% HP, tối đa 2) | — | T | 1 |
| `i_anvil` Đe rơi | 2+ | 48, 30×3 | 4 vòng r1.4t tại vị trí người chơi | 1.2 | T | 3 |
| `i_floor` Sàn nóng | 3 | 48 | Chia 4×4 ô, thắp ô theo mẫu 3s, 2 đợt; đứng trên ô = ×0.8/0.5s | 0.8 | T | 3 |
| `i_sweep` Búa quét | 3 | 48, 30 | 2 nhát quạt 160° r5t luân phiên | 1.5 | Đ | 2 |
| `i_red` *(Heat 8)* Rèn đỏ | Heat | — | Ống phun lửa **×2 tần suất** | 0.8 | T | — |

### 10.6 B5 — Seraphine, Nữ Tế *(Điểm dạy: nhịp điệu, đọc thật/giả)*
| Đòn | Phase | Tele(f) | Hành vi | dmg× | Màu | W |
|---|---|---|---|---|---|---|
| `s_beam` Tia quét | 1+ | 48 | Tia dài 14t rộng 1t quay 40°/s trong 4s (ICD 0.5s/hit) | 1.2 | T | 3 |
| `s_bell` Chuông nhịp | 1+ | 48, 30×3 | 4 vòng nở r7t cách 30f | 0.9 | T | 3 |
| `s_mirror` Nhân bản gương | 2+ | 60 | **3 bản (1 thật, 2 giả)** 12s; bản giả chết 1 đòn, gây 50% dmg, vỡ ra vòng ánh sáng; **bản thật có bóng đổ + halo mờ**; kết thúc sớm khi 2 bản giả chết | — | — | 2 |
| `s_reflect` Phản chiếu | 2+ | 36 | Tinh thể phản **đạn** người chơi 4s (cận chiến không bị) | 1.0 | Đ | 1 |
| `s_silence` Im lặng | 3 | 48 | **Khoá Q/E/R 3s** mỗi 12s (nút xám trước 48f) | 0 | — | cố định |
| `s_rain` Mưa ánh sáng | 3 | 48, 36×3 | 14 cột r1t trong 4s, 4 cột/đợt | 1.0 | T | 3 |
| `s_beam2` *(Heat 8)* Tia kép | Heat | 48 | `s_beam` 2 tia đối nhau | 1.2 | T | 1 |

### 10.7 F — Vua Tro (Trái Tim Tro) — 4 phase (75/50/25)
| Phase | Đòn | Tele(f) | Hành vi | dmg× | Màu | W |
|---|---|---|---|---|---|---|
| **1 Hiệp Sĩ** | `k_sword` Kiếm lửa | 48 | Quạt 110° r3t + sóng lửa bay 8t | 1.3 | Đ | 3 |
| | `k_dash` Lao | 48 | Dài 10t, rộng 1.5t | 1.5 | Đ | 2 |
| | `k_slam` Đập | 54 | Vòng r3t tại người chơi | 1.6 | T | 2 |
| **2 Dã Thú** | `k_pounce` Vồ | 54 | Bóng vòng r2.5t tại chân người chơi, 54f sau nhảy xuống | 1.6 | T | 3 |
| | `k_roar` Gầm | 54 | Sóng nở r8t, 8 t/s; trúng = ×0.5 + **Fear 2s** (**không thể tiến lại gần boss**). **Né bằng dash i-frame; Barrier/Kết Giới hấp thụ Fear** | 0.5 | T | 2 |
| | `k_claw` Cào | 48, 20×2 | 3 vệt quạt 90° r2.4t | 1.1 | Đ | 3 |
| **3 Lốc Lửa** | **Arena thu hẹp**: bán kính **18t → 9t trong 40s**, rìa lửa = ×0.6/0.5s | — | — | 0.6 | T | — |
| | `k_pillar` Cột lửa | 48 | 6 cột r1.2t quanh/ở chân người chơi | 1.2 | T | 3 |
| | `k_sweepf` Quét lửa | 48 | 3 cánh quay 50°/s trong 4s | 1.0 | T | 2 |
| **4 Trái Tim** | Boss thành **Lõi** bất tử ở tâm; **4 Lõi Phụ** (HP 400 ×1.0) quay quanh. Diệt cả 4 → Lõi **dễ tổn thương 8s**; Lõi Phụ **hồi sinh** khi hết cửa sổ. Phase kết thúc = HP 0 | | | | | |
| | `k_spiral` Xoắn ốc | 36 | 3 cánh xoắn 30°/s, 1 đạn/6f/cánh, 6s, đạn 5 t/s | 0.6 | Đ | 3 |
| | `k_petal` Cánh hoa | 48 | 3 vòng 20 đạn (4 t/s) chừa **làn an toàn** 2 rộng | 0.6 | Đ | 3 |
| | `k_aim` Đạn dò | 36 | 5 loạt × 3 đạn (6 t/s) nhắm người chơi | 0.7 | Đ | 2 |

### 10.8 S — Người Mang Lửa Rỗng (Hư Không)
- **Build:** đọc `lastRun` trong save: `class, weapon, aspect, relics[]`. **Tối đa 4 relic**, chọn theo **độ hiếm cao → stack cao**, **loại**: `l01, e03, r05, u17, c05, c19, u11, u10` và mọi relic `economy`/hồi máu. Không có dữ liệu → mặc định **Ashblade + Kiếm Tro + [u02, u06, c01, c04]**.
- **Hành vi:** đánh theo **combo vũ khí** (thêm **+30f startup**, tele đỏ ≥ 48f), dùng Q/E theo CD (tele 48f, dmg skill nhân `bossDmg 24/ skillBase`), 3 phase (66/33): **phase 2** bật *Surge giả* (+25% AS trong 8s, mỗi 30s); **phase 3** rút gap còn **18f**.
- **Trọng lực luân phiên:** mỗi **6s** đổi chiều lực hút **1.5 t/s** về tâm / ra mép (cảnh báo 2s bằng mũi tên nền); người chơi và boss đều bị ảnh hưởng; **dash miễn nhiễm** trong lúc dash.
- Thắng: mở **True Ending**, `l04`, **+300 Soul Ember**, +10 Mảnh Hư Không.

**Mini-boss (6 có tên)** → **v1.1** (D-14).

---

## 11. Sinh màn Procedural

### 11.1 Nguyên tắc
**Đồ thị phòng (graph) + phòng sinh theo mẫu tham số (pattern generator)**: không cần vẽ tay hàng trăm chunk. Chunk/Template vẽ tay (ASCII, §25.4) là **polish tuỳ chọn** — chèn thêm vào thư viện, không đổi code. Mọi thứ **tất định** theo seed (`DET-01`).

### 11.2 Quy trình
```
[GEN-01] Seed → hash cyrb128 → 5 RNG stream độc lập (sfc32): gen, loot, combat, event, cosmetic.
         gen    = seed(seedStr | 'gen'    | biomeIdx)      // sinh đồ thị + layout biome đó, TẠI THỜI ĐIỂM VÀO BIOME
         combat = seed(seedStr | 'combat' | roomId)         // mỗi phòng 1 stream: reroll/đổi hành vi không lệch phòng khác
         loot   = seed(seedStr | 'loot')                    // 1 stream cho cả run, chỉ tiêu thụ khi cần loot
         event  = seed(seedStr | 'event'  | roomId)
         cosmetic = Math.random-like (không ảnh hưởng sim): particle, rung nhẹ, âm
[GEN-02] Đồ thị 7 layer: kích thước layer = [1, n2, n3, n4, n5, 1, 1], n ∈ {2 (55%), 3 (45%)}.
         Mỗi node có "lane" 0..2 theo vị trí ngang. Cạnh chỉ nối node ở layer kề, |lane lệch| ≤ 1, không cắt nhau.
         Mỗi node ≥1 cạnh ra và ≥1 cạnh vào; out-degree ≤ 3. L1→tất cả L2; L5→L6 (Rest); L6→L7 (Boss).
[GEN-03] Gán loại node cho L2–L5 (stream gen): đặt Shop (L3–L5), Event (≥1), Elite (L4–L5; B1: 1, B2–B5: 1–2),
         Shrine (50%), Treasure (40%), còn lại Combat. Kiểm luật STR-01..07; vi phạm → gán lại (≤10 lần) → fallback tất định.
[GEN-04] Mỗi node → kích cỡ phòng + layoutPattern (§11.4) + seed phòng.
[GEN-05] Reward cho từng node (stream loot): xem §12.5.  Bảo đảm ≥1 phòng Combat có thưởng Relic ở L2–L3.
[GEN-06] Spawn theo Threat Budget (§9.6): điểm hợp lệ ≥6t cách cửa vào/ra, không trong tường/hazard, bán kính trống ≥1t, cách nhau ≥2t.
[GEN-07] Secret (biome 2–4): chọn 1 phòng Combat/Event ở L3–L5 làm nơi giấu lối vào (§13.4).
[GEN-08] VALIDATE: flood-fill từ cửa vào chạm TẤT CẢ cửa ra + ≥90% ô sàn; hành lang ≥2 ô; hazard ≤ trần (§11.5); không spawn trong tường.
[GEN-09] Fail → thử lại với seed phụ `seedStr|gen|b|retry n` (≤10 lần) → fallback: layout `open` an toàn (luôn hợp lệ).
```
- `[DET-01]` **Tất định:** mô phỏng **chỉ** dùng RNG stream; **cấm** `Math.random`, `Date.now`, `performance.now` trong sim; `dt` cố định 1/60; duyệt entity theo mảng có thứ tự; **cấm** `Math.sin/cos/atan2/pow/exp` trong sim (kết quả có thể khác giữa engine) → dùng `fsin/fcos/fatan2` tự cài (§25.1) và bảng hằng `ENM-01`. Cùng seed + cùng input trên cùng trình duyệt = cùng kết quả; **sinh map luôn giống nhau mọi thiết bị** vì chỉ dùng số học + RNG.
- `[DET-02]` Camera, particle, rung, âm = **cosmetic** (không vào sim).

### 11.3 Kích thước phòng (ô sàn *bên trong* tường; 1 ô = 16px)
| Loại | Kích thước | Ghi chú |
|---|---|---|
| Combat nhỏ | **30×14** | ≥ viewport ngang tối thiểu (360px) nên không bị viền đen |
| Combat lớn | **40×21** | |
| Elite | **36×18** | |
| Shop/Rest/Event/Shrine/Treasure/Secret | **30×14** | |
| Boss | **40×22** | arena riêng (§10) |
- **Cửa vào** luôn ở **giữa tường Tây**; **cửa ra** ở **tường Đông**: 1 cửa = hàng giữa; 2 cửa = 25% & 75% chiều cao; 3 cửa = 15%/50%/85%. Mỗi cửa rộng **3 ô**. Vùng 5×5 trước cửa vào/ra **luôn trống**.
- Sau khi dọn: cửa mở, phát sáng + icon thưởng. Đi vào cửa = chuyển phòng (fade 12f ra, 12f vào).

### 11.4 Layout pattern (bộ sinh phòng chiến đấu) — chọn theo trọng số
Ký hiệu ô: `#` tường · `.` sàn · `P` cột/bia (chặn đi + chặn đạn) · hazard theo biome (§11.5).
| # | Pattern | Quy tắc sinh (tất định) |
|---|---|---|
| 1 | `open` | Sàn trống + 0–3 cột ngẫu nhiên |
| 2 | `pillars_grid` | Cột mỗi 6 ô (lệch 3 ô mỗi hàng), bỏ cột nào lọt vùng an toàn |
| 3 | `pillars_ring` | 6–8 cột đều trên vòng bán kính 5 ô quanh tâm |
| 4 | `cover_walls` | 4–6 đoạn tường dài 3–4 ô, ngang/dọc ngẫu nhiên, cách nhau ≥3 ô |
| 5 | `central_block` | Khối 3×3 → 5×3 ở tâm, chừa làn ≥3 ô hai bên |
| 6 | `corridors` | 2 tường ngang dài, mỗi tường chừa 2 khe rộng 3 ô |
| 7 | `l_shapes` | 2–3 tường hình L cạnh 4 ô |
| 8 | `hazard_patch` | 3–5 mảng hazard 3×3 trên sàn trống |
| 9 | `hazard_lines` | 2–3 dải hazard ngang/dọc, mỗi dải chừa khe 3 ô |
| 10 | `arena_circle` | Cắt 4 góc phòng thành tường hình tròn, bán kính hiệu dụng ≥ 6 ô |
| 11 | `split_room` | Vách giữa dọc có 2 khe 3 ô |
| 12 | `scatter` | Cột ngẫu nhiên kiểu Poisson-disc, khoảng cách ≥4 ô, mật độ ≤6% sàn |
Trọng số: B1 `open 2, pillars_grid 2, cover_walls 3, scatter 3, l_shapes 2, split_room 1, hazard_patch 1` · B2–B5: thêm `hazard_patch/hazard_lines` (+3 mỗi) và biome-đặc-trưng (`B3 corridors+3`, `B4 central_block+2`, `B5 pillars_ring+3`). Elite: ưu tiên `arena_circle, pillars_ring, open` ×2. Phòng tiện ích: dùng `open` + đạo cụ cố định.

### 11.5 Hazard theo biome (trần mật độ = % ô sàn; Heat 13 ×1.25)
| Biome | Hazard | Hành vi chính xác | Trần |
|---|---|---|---|
| B1 | **Gai đất** `S` | Chu kỳ **120f**: trồi báo **36f** (tele), nhô **18f** gây **10×scale** (ICD 0.6s) | 6% |
| | **Bẫy nổ** (đĩa nhấn) | Bước lên → **fuse 48f** (vòng đỏ r1.5t) → **×2.0**; địch né | |
| | **Bia mộ** `P` | Chặn đi + chặn đạn | |
| B2 | **Vũng độc** `X` | Đứng trong: tick **4×scale/0.5s** + Poison người chơi (−50% hồi máu) | 10% |
| | **Dây leo** `V` | Chạm: **−50% tốc**; ở trong >0.5s → **giữ chân 1s** (dash thoát được) | |
| B3 | **Nước dâng/hạ** | Đổi mỗi **12s** (cảnh báo 2s bằng sóng sáng). **Thấp:** gai lộ theo mẫu. **Cao:** Volt +20%, tốc −10%, gai chìm | 12% |
| | **Dòng chảy** | Ô có mũi tên: đẩy **3 t/s** | |
| B4 | **Dung nham** `L` | Chạm: **×1.0** + Burn 2s, đẩy ra ngoài, ICD 0.6s; *miệng phun* chu kỳ 240f tele 36f | 14% |
| | **Băng chuyền** | Đẩy **2 t/s** theo mũi tên | |
| | **Búa ép** | Ô đơn: tele **48f** → **×2.0**, chu kỳ 240f | |
| B5 | **Tia sáng quét** | Đế cố định, tia dài 10t quay **30°/s**, tele luôn hiện đường mảnh; ×1.0 (ICD 0.6s) | 12% |
| | **Chuông** | Mỗi **240f** phát vòng r5t (tele 48f, **T**) ×0.9 | |
| | **Gương** | Phản **đạn** (cả hai bên) | |
- `[HAZ-01]` Hazard **luôn có telegraph** (`TEL-01`); hazard không gây dmg khi người chơi đang dash i-frame. Địch **không** bị hazard của chính biome họ (trừ Nấm bị nổ/vũng của người chơi gây Burn…).

### 11.6 Seed, Seed Link & Daily
- `[SEED-01]` Seed = `ASH-XXXX-XXXX` (8 ký tự **Crockford Base32** `0123456789ABCDEFGHJKMNPQRSTVWXYZ`, không phân biệt hoa/thường, `I/L→1`, `O→0`). Nhập tay ở Hub (Zhuri).
- `[SEED-02]` **Seed Link (🟢):** `…/#s=ASH-XXXX-XXXX&c=<class>&h=<heat 0-20>&m=<mutator ids,>` → mở game tự điền màn chuẩn bị; **không** gửi gì lên server. Tham số lạ bị bỏ qua (whitelist).
- `[SEED-03]` **Daily:** `seed = base32(cyrb128("daily|" + yyyy-mm-dd UTC + "|v1"))`; **class** = `classes[h % 4]`; **mutator** = 50% không, 50% = `mutators[h2 % 10]`; Heat cố định **3**. 1 điểm tốt nhất/ngày lưu local; hiển thị đếm ngược sang ngày mới UTC.
- `[SEED-04]` Loot dùng stream riêng: mở menu/reroll không làm lệch phòng; Heat/Mutator **không đổi** việc stream được tiêu thụ ở phòng đã sinh (chỉ đổi tham số số học).
- `[SEED-05]` Điểm số = `rooms×100 + boss×500 + (thời gian < 30′ ? bonus : 0) − hits×15`, công thức hiển thị rõ ở màn tổng kết.

---

## 12. Kinh tế & Loot

### 12.1 Tiền tệ
| Tiền | Phạm vi | Nguồn | Dùng cho |
|---|---|---|---|
| **Vàng** | Trong run | Kill, rương, event, cửa thưởng | Shop, reroll, nâng Rank, cược |
| **Tàn Hồn** (Soul Ember) | Meta (giữ mãi) | Cuối run | Cây Tàn Lửa, công thức Evolution, mở khóa |
| **Chìa Khóa Ký Ức** | Meta | Boss lần đầu, achievement | Mở nội dung khóa (Aspect đặc biệt, skin) |
| **Mảnh Hư Không** | Meta | Secret / Hư Không | Skin đặc biệt, danh hiệu Hư Không |
- `[ECO-02]` Vàng **mất khi chết**; Tàn Hồn **giữ**. Vàng nhặt: tự hút trong **2.5t** (relic c19 +50%); phòng dọn xong **tự hút toàn bộ**.

### 12.2 Vàng trong run *(thu nhỏ so với v1.0 vì chỉ 35 phòng)*
```
[ECO-01] Combat gold   = randInt(12,20) × (1 + 0.15×Biome)              // chia theo threat của kẻ bị giết
         Cửa thưởng Vàng: + randInt(20,30) × (1 + 0.15×Biome)
         Elite: + 30 × (1+0.15×Biome)   Boss: + 50 × (1+0.15×Biome)
Mục tiêu tổng ≈ 1.100–1.300 vàng/run đầy đủ.
```

### 12.3 Giá & Shop
| Vật phẩm | Giá |
|---|---|
| Relic Common | 40–60 |
| Relic Uncommon | 80–110 |
| Relic Rare | 150–200 |
| Relic Epic | 280–350 |
| Relic Legendary | 500+ (hiếm khi bán) |
| Consumable | 25–70 (§8.7) |
| Rune | 60–90 |
| Whetstone (+1 Rank) | 100 (+20/lần mua trong run) |
| Reroll Shop | 25 + 15×n |
- **Shop có:** 3 relic (slot #1 **≥Rare 1/3 số lần vào**, `LOOT-03`) · 2 consumable · 1 rune (50%) · 1 Whetstone · nút Reroll. Heat 5: relic còn 2 slot. Giá trong khoảng = `lerp` theo stream loot. Giảm giá meta ≤10%.
- **Soul Ember cuối run** *(điều chỉnh vì 35 phòng)*:
```
[ECO-03] Embers = (Rooms×3 + Elites×8 + Bosses×40 + FinalBoss×60 + FirstClear 150 + Ending(A/B 100, True 300)) × (1 + 0.05×Heat)
```
`Ending` và `FirstClear` chỉ cộng **lần đầu** mỗi loại. Full clear lần đầu ≈ **600–650**; thắng lặp lại ≈ **400**; chết sớm ≈ **40–120**. Với tỉ lệ thắng ~30%, trung bình ≈ 180/run → Cây Tàn Lửa (≈ 6.000) ≈ **33 run**.

### 12.4 Loot & Bad-luck Protection
```
[LOOT-01] weight_i' = weight_i × (1 + Luck × tierBonus_i)
          tierBonus: Common −0.010 · Uncommon 0 · Rare +0.050 · Epic +0.080 · Legendary +0.100   (mỗi 1 Luck)
[LOOT-02] Pity: mỗi 4 lần chọn relic không ra Rare+ → +5% cộng vào weight Rare (reset khi ra; Meta Vận May hạ ngưỡng còn 3).
[LOOT-03] Shop slot #1 ≥ Rare ít nhất 1/3 số lần vào Shop.
[LOOT-04] Không lặp relic đã max stack; relic `req` không khớp vũ khí bị loại khỏi pool.
```
**Trọng số độ hiếm theo biome (trước Luck/Pity):** C / U / R / E / L
B1 `70/24/5/1/0` · B2 `55/32/10/3/0` · B3 `40/35/18/6/1` · B4 `30/35/25/8/2` · B5 `20/35/30/12/3`. **Elite thưởng:** bỏ Common (chia lại). **Rương boss:** 3 lựa chọn, `Rare 60 / Epic 33 / Legendary 7`.

### 12.5 Phần thưởng cửa (`reward`) cho phòng Combat
Trọng số: **Vàng 30 · Relic 20 · Whetstone 15 · Consumable 15 · Heal 15 · Mystery(?) 5**. Elite luôn = Relic (≥Uncommon) + vàng Elite. **Heal** = hồi 25% Max HP khi dọn xong. **Mystery** = 1 trong các loại trên (stream loot), hiện `?` (khai báo rõ trong tooltip, không có rủi ro âm).
- **Rương (Treasure):** Gỗ 40% (vàng 40–60×scale) · Sắt 30% (1 consumable + 20 vàng) · Mạ Vàng 20% (chọn 1/3 relic ≥Uncommon) · Nguyền 5% (chọn 1/3 **Epic** + 1 Curse; Heat 15: 15%) · **Mimic 5%** — **dấu hiệu:** rương rung nhẹ mỗi 3s + răng trên nắp; mở = chiến đấu Elite-lite (HP ×0.7, không affix), thưởng chọn 1/3 relic ≥Uncommon.

---

## 13. Sự kiện, Shrine, NPC, Secret

### 13.1 Event (12 tại launch)
`[EVT-01]` Mỗi event **không lặp trong run**; hiển thị rõ khoảng rủi ro; ngẫu nhiên bằng stream `event`.
| ID | Tên | Lựa chọn → kết quả (chính xác) |
|---|---|---|
| `evt_mirror` | Gương Nguyền | **Nhìn:** +1 Curse ngẫu nhiên, chọn 1/3 relic **Epic** · **Đập vỡ:** −20% HP hiện tại, chọn 1/3 **Rare** · **Rời đi:** không |
| `evt_ghost_merchant` | Người Buôn Ma | **Mua:** 3 relic giá **−30%** · **Cướp:** chiến đấu 1 Elite (không affix) → chọn 1/3 relic ≥Uncommon + vàng Elite · **Tha:** 1 Blessing ngẫu nhiên |
| `evt_gambler` | Bàn Đánh Bạc | Cược **50 vàng** (tối đa 3 lần): chọn **×1.5 (thắng 60%)** / **×2 (45%)** / **×3 (30%)**; thua = mất cược |
| `evt_altar` | Đài Hiến Tế | **Hiến 25% Max HP** (không xuống <1) → chọn 1/3 **Epic** · **Hiến 1 relic** → vũ khí **+2 Rank** · **Không** |
| `evt_well` | Giếng Ước | Ném **50/100/200** vàng → relic: 50 = `none 50 / C 35 / U 15` · 100 = `none 30 / U 45 / R 25` · 200 = `none 15 / R 55 / E 30` (%) |
| `evt_blacksmith` | Thợ Rèn Lạc | **Rèn 100 vàng:** +1 Rank · **Bán 1 relic** = 60% giá shop · **Trộm:** 50% +1 Rank miễn phí, 50% chiến đấu 1 Elite (không affix) |
| `evt_corpse` | Xác Lính Cũ | **Lục:** +1 consumable, 20% dính bẫy (−10% Max HP hiện tại) · **Chôn:** 1 Blessing |
| `evt_mimic_chest` | Rương Cắn | **Mở:** 35% Mimic / 65% `80–120×scale` vàng · **Chọc:** lộ ra: Mimic (HP ×0.5, thưởng như trên) hoặc rương thường (+40 vàng) |
| `evt_ash_cat` | Mèo Tro *(B1–B3)* | **Cho ăn** (1 consumable hoặc 30 vàng): **Gợi Ý** — hiện 🔍 trên node chứa Secret của **biome kế tiếp** · **Bỏ qua** |
| `evt_wanderer` | Kẻ Lạc Đường *(B2–B4)* | **Hỏi:** lộ icon thưởng mọi node chưa đi · **Mua bản đồ 40 vàng:** như trên + lộ **loại node** + 🔍 Secret biome này · **Bỏ đi** |
| `evt_statue` | Tượng Cầu Nguyện | Chọn miễn phí 1/3: **+10% ATK** / **+40 Armor** / **+15% tốc di chuyển** *đến hết biome* |
| `evt_ash_pool` | Hồ Nước Tro | **Uống:** hồi 30% Max HP, 30% nhận 1 Curse · **Rửa:** gỡ 1 Curse (không có: +10 Max HP) · **Múc đầy bình:** Flask +1 charge ngay |

### 13.2 Shrine (8)
| Shrine | Hiệu ứng |
|---|---|
| Máu | Trả **20% HP hiện tại** → +`60×(1+0.15B)` vàng |
| Sức Mạnh | **+15% ATK** 3 phòng |
| Tốc Độ | **+12% tốc di chuyển & AS** 3 phòng |
| May Mắn | **+10 Luck** hết biome |
| Thanh Tẩy | Gỡ 1 Curse (không có: **+1 Flask charge**) |
| Lửa | Ember Surge = **100** ngay |
| Tham Lam | Vàng **×2** 3 phòng, địch **+25% HP** 3 phòng |
| Hiến Tế | Tiêu 1 relic (chọn) → **+1 stack** cho relic khác chưa max |
`[SHR-01]` Mỗi Shrine dùng **1 lần**. Có nút "Rời đi" luôn miễn phí.

### 13.3 NPC
| NPC | Vị trí | Chức năng |
|---|---|---|
| **Thợ Rèn Brann** | Hub | Chọn **vũ khí** + **Aspect**, xem Mastery vũ khí |
| **Nhà Giả Kim Odessa** | Hub | Chọn **consumable khởi đầu** (Tinh Thông T7), học **công thức Evolution** (50 Tàn Hồn) |
| **Người Lưu Trữ Milo** | Hub | **Codex**, lore, **thống kê**, **Xuất/Nhập save**, Share Card |
| **Bà Bói Zhuri** | Hub | **Heat**, **Mutator**, Custom Run, **Seed/Daily** |
| **Huấn Luyện Viên Tara** | Hub | **Cây Tàn Lửa**, Mastery lớp, **Sân Tập** |
| **Thương Nhân Kỳ Dị** | Trong run | Shop |
| **Kẻ Lạc Đường** | Trong run | Event `evt_wanderer` |
- `[NPC-01]` Mỗi NPC ≥ **8 dòng thoại/mốc** (mốc: lần đầu · chết lần đầu · hạ B1 · tới B3 · thắng lần đầu · mở Heat · có Void Key · True Ending); không lặp một dòng quá **2 run liên tiếp**; mọi thoại **bỏ qua được**.

### 13.4 Secret & Hư Không
- **Đường vào Hư Không:** thu thập **3 Void Key** *trong cùng 1 run* (Secret biome **2, 3, 4**) → sau khi hạ Vua Tro xuất hiện lựa chọn **"Mở Cổng Hư Không"** → hạ Người Mang Lửa Rỗng → **True Ending**.
- **Lối vào:** biome 2/3/4 mỗi biome có **đúng 1** phòng (Combat/Event, L3–L5) giấu lối vào. **Dấu hiệu:** vết nứt trên tường **Bắc** + bụi rơi mỗi 4s. Gợi Ý (Mèo Tro / Kẻ Lạc Đường) hiện 🔍 trên node đó.
- **Mở lối vào & câu đố:**
  - **B2:** đập vết nứt **3 đòn nặng** (hoặc 1 Bom Tro) → mở.
  - **B3:** vào phòng ẩn; **4 ngọn nến** + bích họa 4 biểu tượng sáng lần lượt (1.2s/cái); **đốt nến theo thứ tự** (chạm gần + nút tương tác). Sai → reset nến (không phạt).
  - **B4:** **3 ống nhiệt** nhấp nháy theo thứ tự; đánh **bất kỳ đòn** vào đúng thứ tự (sai → reset).
- **Phòng ẩn (30×14):** rương **Void Key + chọn 1/3 Epic + 3 Mảnh Hư Không**.
- Void Key **chỉ tồn tại trong run** (HUD hiện ◆◇◇).

---

## 14. Meta-progression (Hub)

### 14.1 Doanh Trại Lò Lửa (Hub = màn hình có hotspot — D-06)
Một cảnh minh họa canvas (lửa trại động, đom đóm tro) + **6 hotspot DOM** (vùng chạm ≥56px): **Cổng Tháp** (bắt đầu run → màn Chuẩn bị) · **Brann** · **Odessa** · **Milo** · **Zhuri** · **Tara** · góc trên: **Cài đặt**, **Tủ Đồ** (skin/danh hiệu). Chạm hotspot → panel DOM trượt vào (hoặc thoại NPC 1–2 dòng rồi panel). Hub **không** có nhân vật đi lại.

### 14.2 Màn Chuẩn bị Run (một màn, 3 cột)
`[SET-01]` **Cột 1:** chọn **Class** (4 thẻ) · **Cột 2:** **Vũ khí** (mở/khóa) + **Aspect** (0–1) + **Consumable khởi đầu** (nếu có T7) · **Cột 3:** **Heat** (slider 0–max đã mở + preset §15.1), **Mutator** (chip), **Seed** (ô nhập / "Ngẫu nhiên" / **Sao chép Seed Link**). Nút **BẮT ĐẦU** lớn. Nhớ lựa chọn lần trước.

### 14.3 Cây Tàn Lửa (36 node, 4 nhánh × 9, tuyến tính — mua theo thứ tự)
`[META-01]` Trần meta-power ≈ **+25%** (HP ≤ +25%, ATK ≤ +12%, giảm giá ≤ 10%). `[META-02]` **Đặt lại nhánh** miễn phí và **hoàn 100% Tàn Hồn** đã tiêu ở nhánh đó.
| # | **Sinh Lực** (cost) | **Uy Lực** (cost) | **Vận May** (cost) | **Tinh Thông** (cost) |
|---|---|---|---|---|
| 1 | +3% HP (40) | +2% ATK (50) | Bắt đầu +30 vàng (40) | **+1 slot consumable** (200) |
| 2 | +3% HP (60) | +3% Crit (80) | +5 Luck (80) | Xem trước icon `?` (120) |
| 3 | **Flask +1 charge** (150) | +2% ATK (100) | Shop −5% giá (100) | **+1 reroll relic/run** (150) |
| 4 | +4% HP (90) | +10% poise dmg (110) | +8% vàng (120) | Aspect mở sớm (Mastery −1) (200) |
| 5 | Rest hồi +10% HP (120) | +2% ATK (140) | Reroll Shop đầu **miễn phí** (150) | Rest: **Thanh Tẩy** miễn phí 1 curse (100) |
| 6 | +4% HP (130) | +10% Crit Damage (170) | Shop −5% giá (160) | **+1 slot consumable** (300) |
| 7 | +5% HP (180) | +3% ATK (200) | +5 Luck (200) | Chọn 1/3 consumable khi bắt đầu (250) |
| 8 | Đầu mỗi biome: **Barrier 10% HP** (200) | +10% dmg lên Elite (230) | Pity relic ngưỡng **3** (230) | Vũ khí bắt đầu **Rank II** (350) |
| 9 | +6% HP (250) | +3% ATK (260) | Bắt đầu 1 consumable ngẫu nhiên (250) | Enchant slot 2 mở ở **Rank III** (400) |
Tổng ≈ 1.220 + 1.340 + 1.330 + 2.070 = **5.960** Tàn Hồn. (HP: 3+3+4+4+5+6 = **25%**; ATK: 2+2+2+3+3 = **12%**; giảm giá: 5+5 = **10%**; Luck gốc +10; consumable slot gốc 2 → tối đa 4.)

### 14.4 Mở khóa
`[UNL-01]` Điều kiện hiển thị `???` cho tới khi đạt ≥50% tiến độ. Tiến độ **tích lũy toàn cục** (lưu trong save).
| Mở khóa | Điều kiện |
|---|---|
| Rare: r03 Vòng Sương | Làm **Freeze** 40 kẻ địch |
| r06 Lò Than Sống | Giết 150 kẻ địch bằng **Burn** |
| r07 Mạng Nhện Sét | Kích **Shock lan** 200 lần |
| r08 Bình Độc Đặc | Gây tổng **500 stack Poison** |
| r09 Con Mắt Ám | Kích nổ **Void Mark** 40 lần |
| r12 Hoa Tiêu Lò | Dùng skill **300** lần |
| Epic e01 | Thắng 1 run bất kỳ |
| e02 | **Bị trúng đòn** 300 lần (tích lũy) |
| e03 | Giết **1.500** kẻ địch |
| e04 | **Dash 1.000** lần |
| e05 | Kích **Steam** 25 lần |
| e06 | Dùng **Flask** 50 lần |
| Legendary l01 | Thắng run ở **Heat ≥5** |
| l02 | Thắng 1 run trong **≤35 phút** |
| l03 | Thắng run bằng **cả 4 class** |
| l04 | Hạ **Người Mang Lửa Rỗng** |
| Vũ khí 2 / 3 | Mastery 3 / 10 của class (§6.5) |
| Heat N+1 | Thắng ở Heat N (`HEAT-01`) |
| Evolution | **50 Tàn Hồn/công thức** (Odessa) |

---

## 15. Độ khó (Heat) & Mutator

### 15.1 Preset
| Preset | Mô tả |
|---|---|
| **Hòa Bình** | Địch **−30% dmg**, telegraph **+20%**, Assist mở sẵn (§15.4) |
| **Bình Thường** | Cân bằng mục tiêu (Heat 0) |
| **Khó** | Địch **+15% HP/dmg**, Flask **−1** |
| **Hardcore** | Chết = mất run vĩnh viễn (không Save & Quit/reload), không Assist, +25% Soul Ember |

### 15.2 Heat 0–20 (cộng dồn)
| Heat | Modifier |
|---|---|
| 1 | Địch **+10% HP** |
| 2 | Elite xuất hiện **+15%** (thêm 1 Elite ở phòng Combat L4–L5 với xác suất tương ứng) |
| 3 | Hồi máu **−15%** |
| 4 | Telegraph **−10%** thời gian (không dưới sàn `TEL-01`) |
| 5 | Shop **−1 slot relic** |
| 6 | Vàng **−15%** |
| 7 | Đạn địch **+15% tốc** |
| 8 | Boss **+1 mẫu đòn** (đòn `*Heat 8*` ở §10) |
| 9 | Phòng chiến đấu **+1 wave** |
| 10 | Flask **−1 charge** |
| 11 | Elite **affix ×2** |
| 12 | Địch **+20% dmg** |
| 13 | Hazard **+25% mật độ** |
| 14 | Rest hồi chỉ **50%** |
| 15 | Rương có thể **Nguyền** (Nguyền 15%) |
| 16 | Boss **+1 phase** ("Cuồng Nộ", `BSS-06`) |
| 17 | **10% phòng thường có thêm 1 Elite (không affix)** *(thay Mini-boss, D-14)* |
| 18 | **Max HP −15%** |
| 19 | **Vô hiệu hồi sinh** (l01, Lông Phượng) |
| 20 | Mỗi phòng: **mọi địch nhận 1 affix ngẫu nhiên** |
- `[HEAT-01]` Mở Heat N+1 khi thắng Heat N. `[HEAT-02]` Heat **+5% Soul Ember/Heat**. `[HEAT-03]` Sau khi mở, có thể **chọn tay** từng modifier (như Pact), điểm tổng = Heat tương ứng.
- `heatMult` (dmg địch lên người chơi) = `1.20` nếu Heat ≥12 (kết hợp Hòa Bình/Khó nhân sau cùng).

### 15.3 Mutator (10 — Custom Run)
| Mutator | Hiệu ứng |
|---|---|
| Kính Hai Lưỡi | **ATK ×2**, Max HP **×0.5** |
| Mưa Lửa | Mỗi **6s** 3 vùng lửa r1.2t rơi ngẫu nhiên (tele 36f, ×1.0) |
| Đêm Vĩnh Cửu | Tầm nhìn hẹp (mặt nạ sáng bán kính **6t** quanh người chơi, **telegraph luôn sáng**) |
| Giết Nhanh | Hẹn giờ **90s/phòng**; hết giờ địch **+30% dmg** |
| Quân Đoàn | Số địch **×2**, HP **×0.6** (không vượt 24 sống) |
| Ngân Hàng | Vàng **×2**, **không Shop** |
| Nhân Bản | Địch chết **tách 1 bản 30% HP** (không tách tiếp) |
| Một Chạm | **1 HP** (Barrier vẫn hoạt động) |
| Chỉ Parry | Sát thương người chơi **−70%** trừ **đòn phản** từ Parry/Perfect Dodge |
| Vũ Khí Ngẫu Nhiên | Mỗi phòng đổi **vũ khí đã mở** của class (stream gen) |
`[MUT-01]` Mutator **không** mở achievement chính (có bảng riêng, nhãn "Custom").

### 15.4 Assist Mode (Accessibility)
Bật/tắt từng mục: **Miễn nhiễm sát thương** · **Sát thương nhận −25/50/75%** · **Giảm tốc game 50–100%** (nhân `dt`) · **Aim assist mạnh** (nón ±110°, reach +2t) · **Dash vô hạn** · **Tự dùng Flask** khi HP <30% · **Bỏ qua boss** (cảnh báo, run bị đánh dấu). `[AST-01]` Run Assist **không bị cấm**, đánh dấu *Assist* (không tính bảng cạnh tranh).

---

## 16. Chế độ chơi
| Chế độ | Mô tả |
|---|---|
| **Cuộc Hành Trình** | Run chuẩn 5 biome + Trái Tim Tro (+ Hư Không bí mật) |
| **Vực Sâu** (Endless) | Mở sau khi thắng lần đầu. Mỗi **tầng f** = 5 layer (L1–L4 thường, L5 Elite; **mỗi tầng thứ 5 là boss ngẫu nhiên**). Chủ đề `biome = ((f−1) mod 5)+1`. `HP×1.45^(min(f,5)−1)×(1+0.20×max(0,f−5))`, `DMG×(1+0.22×(min(f,5)−1))×(1+0.08×max(0,f−5))`. Có Rest sau mỗi 2 tầng. Điểm tầng cao nhất (top 10 local) |
| **Thử Thách Hằng Ngày** | §11.6 `SEED-03` |
| **Tùy Chỉnh** | Chọn Class/Heat/Mutator/Seed (không tính achievement chính) |
| **Sân Tập** | Phòng 40×21, dummy đo DPS (HP vô hạn), nút spawn kẻ địch đã gặp, mở mọi relic/vũ khí đã **có trong Codex**; không tính tiến độ |
- `[MODE-01]` Bảng xếp hạng **local**; chia sẻ bằng **Seed Link** + **Share Card**.
- `[MODE-02]` **Autosave** sau mỗi phòng đã dọn (`RUN-01`, §23.3); thoát/kill tab → mở lại vào **ngay đầu phòng kế** (không mất tiến trình). Hardcore: autosave có, nhưng **chết = xoá** và không cho "tải lại".
- *Boss Rush, Weekly, Co-op 2P → v1.1 / Won't (D-14).*

---

## 17. Cốt truyện & Kết thúc
**Bối cảnh:** Vương quốc **Aureth** sụp đổ khi **Vua Tro** thắp *Ngọn Lửa Bất Tử* để trốn cái chết. Ngọn lửa nuốt cả vương quốc, sinh ra **Tháp Tro**. Những "Người Mang Lửa" bị triệu hồi để chống lại ngọn lửa — nhưng chính họ lại nuôi nó.
**Kể chuyện:** mảnh ký ức trong Codex · thoại NPC Hub (đổi theo mốc, §13.3) · môi trường.
**Ba kết thúc (sau Vua Tro):**
1. **Dập Lửa** — diệt ngọn lửa; nhân vật biến mất. *(Ending A)*
2. **Đội Vương Miện** — nhận ngọn lửa, thành Vua Tro mới. *(Ending B → mở "Chu Kỳ Mới": Custom với Heat tối thiểu 5 + skin Vương Miện)*
3. **Thả Ra** — chỉ khi có **3 Void Key**: hạ Người Mang Lửa Rỗng → giải thoát tất cả. *(True Ending)*
- `[NAR-01]` Cutscene = **4–6 thẻ** (nền canvas + chữ DOM), **bỏ qua được**, tối đa **20–30s**. Không chặn gameplay.
- Ending A/B: chọn bằng **2 nút lớn** sau Vua Tro (kèm nút "Mở Cổng Hư Không" nếu đủ Void Key).

---

## 18. UI/UX (DOM + CSS; thế giới = Canvas)

### 18.1 HUD (landscape, tôn trọng safe-area)
| Vị trí | Thành phần |
|---|---|
| Trên-trái | **HP** (thanh 140×12px, số `78/100`), **Barrier** chồng lên (xanh lam), **Surge** (thanh mảnh dưới HP, sáng khi đầy), icon trạng thái đang hưởng/chịu (tối đa 6) |
| Trên-giữa | Nhãn phòng `Biome-Layer` (vd `2-4`), ◆◇◇ Void Key, timer (tuỳ chọn); **Thanh HP boss** (rộng ~50% màn, vạch phase, tên) |
| Trên-phải | **Vàng**, nút **Map**, **Pause**; hàng **consumable** |
| Dưới-phải / trái | Nút cảm ứng (§4.2) + joystick nổi |
| Trên thế giới (canvas) | Số sát thương (font bitmap số 3×5 tự vẽ; trắng/vàng(crit)/màu nguyên tố; cap **40** số), thanh HP địch nhỏ (14px, chỉ hiện khi bị trúng), Elite: thanh + icon affix |
- `[HUD-01]` HUD cập nhật **chỉ khi giá trị đổi** (không ghi DOM mỗi frame); animate bằng CSS `transform/opacity`.
- `[HUD-02]` Relic đang có: nút **🎒** trong Pause → lưới relic + thanh Resonance; nhặt relic mới = toast 2s.
- `[HUD-03]` **Chạm-giữ 500ms** vào relic/vật phẩm/status = tooltip (không dùng hover).

### 18.2 Luồng màn hình
`Boot → Title → Hub ⇄ (Panel NPC) → Chuẩn bị → Run[ Loading → Phòng → Cửa → Chuyển ] → (Pause · Map · Relic) → Tổng kết (chết/thắng, Share Card) → Hub`. Choice UI (nhặt relic, Shop, Event, Shrine, Rest, rương boss) = **modal DOM**.
- `[UI-01]` **Thẻ chọn** (relic/phần thưởng): 3 thẻ ngang, mỗi thẻ ≥ **140×170 CSS px**; **chạm thẻ = chọn + hiện chi tiết; nút "Chọn" xác nhận** (tránh chạm nhầm). Có nút "Bỏ qua" (nhận 30 vàng) cho relic.
- `[UI-02]` Pause: Tiếp tục · Relic · Bản đồ · Cài đặt · Thoát về Hub (**có xác nhận**; run đã autosave).
- `[UI-03]` Tổng kết: nguyên nhân chết (boss/đòn cuối), thời gian, build (icon relic), Tàn Hồn nhận (animate), **Share Card**, **Chơi lại cùng Seed**, **Seed Link**.
- `[UI-04]` Mọi nút DOM ≥ **44×44 CSS px**; khoảng cách giữa các nút ≥ 8px; không có thao tác chỉ làm được bằng hover/chuột phải.

### 18.3 Bản đồ biome
Overlay chỉ đọc: đồ thị 7 layer trái→phải, node có icon loại phòng + icon thưởng; node đã đi sáng, node hiện tại viền; 🔍 cho Secret nếu có Gợi Ý.

### 18.4 Codex
Tab: Kẻ địch · Relic · Vũ khí · Boss · Lore. Mục chưa gặp = `???`. Hiện thống kê (lần chạm, lần giết). Tối đa ~**190 mục** launch (40 enemy + 66 relic + 12 weapon + 7 boss + 5 rune/curse… + lore).

### 18.5 Cài đặt (đầy đủ)
Âm: **Master / Nhạc / SFX** · **Rung** (Tắt/Nhẹ/Vừa) · **Rung màn hình** 0–100 · **Giảm chuyển động** · **Giảm nhấp nháy** · **Mù màu** (Tắt/Deut/Prot/Tri; bật pattern `TEL-06`) · **Cỡ nút** 80–140% · **Độ trong nút** 40–100% · **Tay trái (mirror)** · **Scheme A/B** · **Aim assist** · **Cỡ chữ** S/M/L · **Ngôn ngữ** VI/EN · **FPS** 60/30 · **Chất lượng** Auto/Cao/Thấp · **Số sát thương** Đầy đủ/Rút gọn/Tắt · **Timer** · **Toàn màn hình** · **Xuất/Nhập save** · **Xoá dữ liệu** (xác nhận 2 bước) · **Ủng hộ** (link ngoài, D-03) · Phiên bản + build hash.

### 18.6 Accessibility (bắt buộc)
- `[ACC-01]` **Mù màu:** telegraph dùng **hình + hoa văn + icon** chứ không chỉ màu (`TEL-06`); nguyên tố có **icon riêng** (🔥❄⚡☠◐…) cạnh màu.
- `[ACC-02]` **Giảm nhấp nháy:** không quá **3 lần nhấp nháy/giây**; flash trắng đổi thành **viền sáng**; tắt slow-mo flash.
- `[ACC-03]` **Hold/Toggle:** Guard (E) có chế độ "bấm giữ" hoặc "bấm bật/tắt".
- `[ACC-04]` Cỡ chữ 3 mức, **tương phản ≥ 4.5:1** cho chữ nội dung; DOM có `aria-label`, thứ tự Tab hợp lý (KB).
- `[ACC-05]` **Không** thông tin chỉ truyền bằng âm thanh: mọi cue âm quan trọng (cảnh báo phase, chuông) có **cue hình** tương ứng.
- `[ACC-06]` Bố cục **tay trái** + cỡ nút + độ trong (ở trên) + **Assist Mode** (§15.4).

### 18.7 Onboarding (FTUE) — hướng dẫn *trong* run đầu, không màn hướng dẫn riêng
`[FTUE-01]` Mỗi gợi ý là **thẻ nhỏ không chặn** (không dừng game), hiện **một lần** (`seenTips` lưu trong `meta`), chạm để đóng; bật lại trong Cài đặt.
| # | Điều kiện kích hoạt | Nội dung (`tut.*`) |
|---|---|---|
| 1 | Vào phòng đầu tiên | "Kéo ngón cái trái để di chuyển" (joystick "ma" gợi ý) — tắt khi đã đi ≥3t |
| 2 | Sau gợi ý 1 | "Chạm **ĐÁNH**" — tắt sau 3 đòn trúng |
| 3 | Kẻ địch đầu tiên bắt đầu telegraph **đỏ** | Thẻ màu: **Đỏ = né/chặn · Vàng = Parry · Tím = phải né** (kèm hình mù màu) |
| 4 | Lần đầu bị trúng hoặc sau 25s chưa Dash | "Chạm **DASH** để né — bất tử trong chớp mắt" |
| 5 | Dọn xong phòng đầu | "Chọn cửa theo **icon thưởng**" |
| 6 | Lần đầu thấy lựa chọn relic | "Relic cộng dồn; cùng **tag** kích hoạt **Resonance**" |
| 7 | Vào Rest đầu tiên | "Lửa Trại: hồi máu + nâng cấp vũ khí" |
| 8 | Vào phòng boss đầu | "Boss đổi chiêu theo **phase**; né vòng tím bằng Dash" |
| 9 | Có Parry (Ashblade/Ironwarden) & gặp telegraph vàng đầu tiên | "Bấm **E** đúng lúc đòn **vàng** chạm = Parry" |
- `[FTUE-02]` Run đầu **không** ép Hòa Bình, nhưng màn Chuẩn bị gợi ý *"Mới chơi? Thử Hòa Bình"* (1 dòng).

---

## 19. Art Direction

**Phong cách:** pixel-art tối, tương phản cao, **silhouette đọc được ở 216px cao**. Viền 1px `#0b0a0d` cho mọi entity. Sáng từ **trên-trái**; bóng = ellipse mờ dưới chân (alpha .35). Màu rực **chỉ** dành cho thứ cần chú ý (telegraph, drop, nguyên tố).

### 19.1 Bảng màu (cứng, dùng làm token CSS/JS)
| Biome | bg | floor | wall | accent | phụ | highlight |
|---|---|---|---|---|---|---|
| B1 Nghĩa Địa Tro | `#1a1620` | `#2b2533` | `#463c52` | `#8d7fa3` | tro `#c9c2d1` | `#e8e2f0` |
| B2 Rừng Nấm Độc | `#10190f` | `#1f3320` | `#35553a` | `#7ad36b` | bào tử `#c4f06b` | `#f2ffd0` |
| B3 Thành Chìm | `#0b1822` | `#17384b` | `#2a5a73` | `#4fc3e8` | bọt `#b9ecf7` | `#effcff` |
| B4 Lò Rèn | `#1f0f0b` | `#3a1d14` | `#6b2f1c` | `#ff7a2e` | than hồng `#ffc247` | `#fff0c9` |
| B5 Thánh Đường | `#16131f` | `#2f2a44` | `#4f4673` | `#f1d98a` | ánh sáng `#fff6d6` | `#ffffff` |
| F Trái Tim Tro | `#1a0608` | `#2d0d10` | `#5a1a1e` | `#ff4d3d` | than `#ffb347` | `#fff0e0` |
| S Hư Không | `#050508` | `#0f0f1a` | `#1d1d33` | `#9b6bff` | `#5a3fb0` | `#e6dcff` |
**Nguyên tố:** Physical `#e8e8ee` · Fire `#ff7a2e` · Frost `#7fd8ff` · Volt `#ffe34d` · Venom `#8be04e` · Void `#a35bff`. **Telegraph:** Đỏ `#ff3b3b` · Vàng `#ffd23b` · Tím `#b84bff`. **Người chơi:** thân `#f2e8d5`, accent theo class: Ashblade `#ff7a2e`, Archer `#5fd1a8`, Mage `#a35bff`, Ironwarden `#7aa7ff`.

### 19.2 Hai tầng art (D-10)
**Tier A — "Sprite Forge" (chơi được ngày 1, không cần họa sĩ).** Mọi entity vẽ bằng code từ `archetype + palette biome`, **render 1 lần vào offscreen canvas** (cache theo `id|facing|frame`), sau đó chỉ `drawImage`:
| Archetype | Hình | Kích thước | Ghi chú |
|---|---|---|---|
| Player | Thân tròn 12×14 + mũ/áo màu class + vũ khí là nét/quạt | 16×16 | Mắt 2 chấm hướng `facing` |
| Grunt | Thân chữ nhật bo 12×14 | 16×16 | 2 mắt đỏ |
| Archer | Thân gầy 10×14 + "cung" nét | 16×16 | |
| Rusher | Thân thấp-rộng 14×10 + sừng/nanh | 16×16 | |
| Swarm | Hình thoi nhỏ 8×8 + cánh nháy | 10×10 | Bay |
| Caster | Thân tam giác + quả cầu nổi | 16×18 | |
| Support | Như Caster + dấu `+` | 16×18 | |
| Shielded | Grunt + **khiên cung tròn phía trước** | 18×18 | Khiên xoay theo `facing` |
| Bomber | Tròn 10×10 + ngòi nhấp nháy | 12×12 | Nhấp nhanh dần khi fuse |
| Ambusher | Bóng đậm + 2 mắt | 16×16 | |
| Tank | Khối 20×20 + giáp vai | 24×24 | |
| Elite | Archetype gốc ×1.5 + **viền sáng + icon affix** | 24×24 | |
| Boss | Khối lớn 48–64 px tự do theo từng boss + chi tiết nhận diện (cột sống Gorrak, mũ nấm Mycelia…) | 48–64 | |
Màu thân = `wall` của biome ±lightness theo archetype; viền & mắt = `accent`/`đỏ`. **Cảnh báo tele:** sprite flash trắng 2f khi bắt đầu windup.
**Tier B — Atlas PNG (thay thế sau, không đổi code).** Khoá sprite = `id.anim` (vd `ghoul.walk`). Renderer luôn thử atlas trước, **thiếu thì rơi về Tier A**.
- Cell: player **24×24**, enemy nhỏ **16×16**, vừa **24×24**, tank/elite **32×32**, boss **64×64**, VFX **32×32**. Hướng: 1 hướng + lật ngang (không 8 hướng).
- Anim chuẩn: `idle 4f@6fps` · `walk 6f@12` · `windup` (số frame = tele) · `attack 3f` · `recover 2f` · `hurt 1f` · `die 6f@12`. Player thêm `dash 3f`, `cast 4f`, mỗi vũ khí có `atk1..atkN`.
- Atlas JSON: `{"ghoul.walk":{"x":0,"y":0,"w":24,"h":24,"n":6,"fps":12,"ax":12,"ay":20}}` (ax/ay = điểm neo chân). Build gộp thành **1 PNG ≤ 1024×1024** (≤ 600 KB) nhúng base64, giải mã bằng `createImageBitmap`.

### 19.3 Quy tắc render
- Thứ tự vẽ: `nền phòng (đã bake 1 lần) → decal sàn → bóng → telegraph (trên sàn, dưới entity) → entity sắp theo y → đạn → VFX → ánh sáng (lighter) → số sát thương`. Hazard động vẽ lại; tường/sàn **bake vào 1 offscreen canvas** lúc vào phòng.
- Ánh sáng: **sprite radial gradient dựng sẵn** + `globalCompositeOperation='lighter'`, tối đa **8 nguồn**. Cấm `shadowBlur`, `filter`, gradient tạo mới mỗi frame.
- Hạt: pool SoA ≤ **400**, vẽ bằng `fillRect` 1–3 px (không `arc`). Mỗi vụ nổ ≤ 24 hạt.
- Số sát thương: font bitmap số tự vẽ 3×5 (cache), pool ≤ **40**, gộp số cùng mục tiêu trong 6f.
- **Telegraph vẽ bằng hình đặc + viền** theo `TEL-02/06`: alpha nền 0.25→0.55 lấp dần, viền alpha 0.9.
- Hiệu ứng nhạy cảm (flash, shake) tuân `ACC-02` và slider Cài đặt.

---

## 20. Audio (sinh bằng WebAudio — D-11)

### 20.1 Kiến trúc
`Source → (musicBus | sfxBus) → master → DynamicsCompressor → destination`. Mức: Master 0.8 · Nhạc 0.5 · SFX 0.9. **Duck** nhạc −6 dB trong 150ms khi Parry/Boss chết/Phase.
- `[AUD-01]` Khởi tạo `AudioContext` ở **lần chạm đầu** (mở khoá iOS/Chrome); `visibilitychange→hidden`: `suspend()`; `visible`: `resume()`.
- `[AUD-02]` Tối đa **24 voice SFX** sống; hết chỗ → bỏ voice **ưu tiên thấp nhất** (hit nhẹ < hit nặng < parry/phase). Dùng lại **1 noise buffer** dài 1s; không `ScriptProcessor`.
- `[AUD-03]` Lên lịch nhạc theo **lookahead**: `setInterval(25ms)` đặt note trong cửa sổ `0.1s` tới bằng `ctx.currentTime`.
- `[AUD-04]` Mọi cue âm quan trọng có **cue hình** (`ACC-05`).

### 20.2 SFX (wave, tần số Hz f0→f1, thời lượng ms, vol, ghi chú)
| ID | Wave | Hz | ms | vol | Ghi chú |
|---|---|---|---|---|---|
| `ui_tap` | square | 600 | 30 | .3 | |
| `ui_back` | square | 400→250 | 60 | .3 | |
| `swing` | noise | HP-sweep 1500→4000 | 70 | .25 | highpass |
| `hit_light` | noise+square | 220→110 | 60 | .5 | LP 2k + square 40ms |
| `hit_heavy` | noise+saw | 150→50 | 130 | .7 | + sub 50Hz |
| `crit` | sine | 1200→1800 | 120 | .6 | + `hit_light` |
| `enemy_die` | saw | 260→60 | 180 | .5 | + noise 100ms |
| `player_hurt` | saw | 180→60 | 150 | .8 | + noise 80ms |
| `dash` | noise | BP-sweep 800→2400 | 100 | .35 | |
| `arrow` | triangle | 900→500 | 80 | .3 | |
| `cast_fire` | noise+saw | 300→900 | 220 | .5 | |
| `cast_frost` | triangle | 1400→700 | 250 | .45 | + chime |
| `cast_volt` | square | 80→1600 | 140 | .45 | jitter 30Hz |
| `parry` | square | 880 + 1320 | 150 | .7 | 2 note cùng lúc, ting |
| `perfect_dodge` | sine | 1000→1500 | 100 | .5 | |
| `gold` | square | 880→1320 | 60 | .25 | |
| `relic_pick` | square | arpeggio C-E-G-C | 4×60 | .5 | |
| `shop_buy` | square | 660→990 | 90 | .4 | |
| `door_open` | saw | 120→240 | 300 | .4 | + noise rumble |
| `tele_red` | square | 220 | 40 | .2 | tick lúc bắt đầu tele đòn đỏ/vàng (tuỳ chọn) |
| `tele_purple` | sine | 330→440 | 120 | .3 | |
| `boss_roar` | saw+noise | 90→40 | 700 | .8 | |
| `phase_change` | sine+noise | 60→30 | 600 | .9 | sub boom |
| `flask` | sine | 400→700 | 300 | .4 | "ừng ực" LFO 12Hz |
| `heartbeat` | sine | 60 | 120 | .6 | 2 nhịp, khi HP<25% |
| `win` / `lose` | square | motif 5 nốt lên / xuống | 900 | .5 | |
| `no` | square | 180 | 80 | .3 | thiếu tài nguyên |

### 20.3 Nhạc (sequencer 16 bước, lặp theo hợp âm)
| Màn | Điệu/Giọng | BPM | Tiến trình hợp âm (mỗi hợp âm = 1 ô nhịp) | Màu |
|---|---|---|---|---|
| Hub | C pentatonic trưởng | 66 | C – Am – F – G | ấm, chậm |
| B1 | A Aeolian | 84 | Am – F – C – G | tối, trầm |
| B2 | D Phrygian | 92 | Dm – E♭ – Dm – C | ẩm, lạ |
| B3 | E Dorian | 100 | Em – A – Em – D | lấp lánh nước |
| B4 | C harmonic minor | 110 | Cm – Fm – G – Cm | nặng, công nghiệp |
| B5 | F♯ Aeolian | 76 | F♯m – D – Bm – C♯ | thánh ca, thưa |
| Boss (mọi biome) | giọng biome | **BPM +16** | như biome | thêm lead |
| Vua Tro | D Aeolian | 124 | Dm – B♭ – F – C | dồn dập |
| Hư Không | cụm bán cung/drone | 60 | drone Fm + nốt rời | lạnh |
- **Lớp (stem):** `bass` (triangle, gốc hợp âm, mẫu 1 trong 6) · `pad` (sine 2 nốt mềm) · `arp` (xung 12.5% — `PeriodicWave`, 16th) · `lead` (xung 25%, motif 4 nốt biến tấu mỗi ô nhịp) · `drums` (kick sine 120→40Hz, snare noise+200Hz, hat noise HP 6k).
- **Cường độ:** *Khám phá* = bass+pad · *Chiến đấu* = +drums+arp (vào khi có địch aggro, ra sau 3s hết địch, crossfade 0.5s) · *Boss* = +lead, BPM +16.
- Mẫu nốt sinh **tất định theo biome** (stream cosmetic seed theo tên biome) để mỗi biome luôn nghe giống nhau. Tần số: `f = 440 × 2^((n−69)/12)` (audio là cosmetic → được dùng `Math.pow`).

---

## 21. Achievement, Codex, Thống kê

### 21.1 Achievement (30, lưu local, hiện toast; không có Steam)
| # | Tên | Điều kiện |
|---|---|---|
| 1 | Ngọn Lửa Không Tắt | Chết lần đầu |
| 2 | Xương Vương Gục Ngã | Hạ Gorrak |
| 3 | Mẹ Nấm Im Tiếng | Hạ Mycelia |
| 4 | Kỵ Sĩ Chìm Nổi | Hạ Vael |
| 5 | Lò Rèn Nguội | Hạ Ignar |
| 6 | Nữ Tế Lặng Thinh | Hạ Seraphine |
| 7 | Tàn Lửa Cuối | Hạ Vua Tro (thắng run) |
| 8 | Dập Lửa | Ending A |
| 9 | Đội Vương Miện | Ending B |
| 10 | Thả Ra | True Ending |
| 11 | Không Một Vết Xước | Hạ 1 boss không bị trúng |
| 12 | Tay Phản Đòn | Parry 50 lần (tích lũy) |
| 13 | Gió Cuốn | Perfect Dodge 100 lần |
| 14 | Phản Ứng Dây Chuyền | Kích 6 loại Reaction khác nhau trong 1 run |
| 15 | Tiến Hóa | Có 1 relic Evolved |
| 16 | Nhà Sưu Tầm | Mở 40 mục relic trong Codex |
| 17 | Phú Ông | Giữ 500 vàng cùng lúc |
| 18 | Nhịn Ăn | Thắng run không dùng Flask |
| 19 | Bốn Ngọn Lửa | Thắng bằng cả 4 class |
| 20 | Nóng Rực | Thắng Heat 5 |
| 21 | Lò Than | Thắng Heat 10 |
| 22 | Cực Hạn | Thắng Heat 20 |
| 23 | Chạy Nước Rút | Thắng ≤30 phút |
| 24 | Thám Tử Tro | Tìm 3 phòng Secret trong 1 run |
| 25 | Chìa Khóa Hư Không | Giữ 3 Void Key |
| 26 | Săn Mimic | Diệt 5 Mimic |
| 27 | Vực Sâu | Tới tầng 15 chế độ Vực Sâu |
| 28 | Chiến Binh Mỗi Ngày | Hoàn thành 7 Daily |
| 29 | Bậc Thầy | Mastery 20 một class |
| 30 | Tay Mơ Chuyên Nghiệp | Chết 100 lần |
`[ACH-01]` Run có Mutator/Assist/Custom **không** mở achievement 1–29 (nhãn *Custom*).

### 21.2 Thống kê (lưu local, hiển thị ở Milo)
Số run/thắng/chết · chết theo nguyên nhân (boss/đòn/hazard) · thời gian chơi · kill theo kẻ địch · sát thương gây/nhận · parry/perfect dodge/dash · tỉ lệ thắng theo class/vũ khí/Heat · run nhanh nhất · Heat cao nhất · tầng Vực Sâu cao nhất · số Daily hoàn thành. (Đây là chỉ số chơi **cục bộ**, không gửi đi đâu.)

---

## 22. Localization
- `[L10N-01]` Ngôn ngữ launch: **VI (mặc định nếu `navigator.language` bắt đầu bằng `vi`) + EN**. Lựa chọn lưu trong settings.
- `[L10N-02]` **Mọi chữ** hiển thị lấy qua `t(key, params)` từ `vi.json`/`en.json` (inline vào build). Khoá: `ui.*`, `item.<id>.name|desc`, `enemy.<id>.name`, `boss.<id>.name`, `evt.<id>.*`, `npc.<id>.<milestone>.<n>`, `ach.<n>.*`, `tut.*`.
- `[L10N-03]` **Mô tả tự sinh từ dữ liệu**: chuỗi dùng placeholder `{v}`, `{a}/{b}/{c}` lấy từ data relic → đổi số trong data không phải sửa chuỗi.
- `[L10N-04]` Font: stack hệ thống `system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", sans-serif` (đảm bảo dấu tiếng Việt, không dính bản quyền font). Test bắt buộc với chuỗi `ệ ữ ặ ẳ ỡ ợ`. UI chịu được **EN dài hơn +30%**.
- `[L10N-05]` Số: `Intl.NumberFormat(locale)`; ngày Daily luôn **UTC**.

---

## 23. Offline, PWA, Save, Bảo mật

### 23.1 PWA (cài như app)
Gói phát hành: `index.html` (game, inline JS/CSS/data/atlas) + `sw.js` + `manifest.webmanifest` + `icons/{192,512,maskable-512}.png`.
```json
{ "name":"Ashbound Depths — Vực Tro Tàn", "short_name":"Ashbound", "start_url":"./?src=pwa", "scope":"./",
  "display":"fullscreen", "orientation":"landscape", "background_color":"#0b0a0d", "theme_color":"#0b0a0d",
  "icons":[{"src":"icons/192.png","sizes":"192x192","type":"image/png"},
           {"src":"icons/512.png","sizes":"512x512","type":"image/png"},
           {"src":"icons/maskable-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}] }
```
- `[PWA-01]` **Service worker:** cache `ashbound-v{BUILD}`; **precache** `index.html`, manifest, icons; fetch = **cache-first** cho GET cùng origin, **navigation fallback** = `index.html`; `activate` xoá cache cũ. Có bản mới → **không** reload giữa run; hiện toast *"Có bản cập nhật — áp dụng khi về Hub"*.
- `[PWA-02]` iOS: meta `apple-mobile-web-app-capable=yes`, `apple-mobile-web-app-status-bar-style=black-translucent`, `apple-touch-icon`. Safari **không cài tự động**: hiện **banner hướng dẫn một lần** "Chia sẻ → Thêm vào Màn hình chính" (dò `!navigator.standalone` + UA iOS). Phát hiện standalone: `matchMedia('(display-mode: standalone)')` hoặc `navigator.standalone`.
- `[OFF-01]` **Runtime không gọi mạng** (không analytics, không CDN, không font ngoài). Chỉ link "Ủng hộ" mở tab mới khi người chơi bấm.

### 23.2 Giới hạn nền tảng cần biết
- **iOS/iPhone Safari:** không có Fullscreen API cho phần tử tuỳ ý → không khoá được landscape → dùng overlay xoay ngang (D-01) và khuyến khích PWA.
- **Safari (tab thường):** dữ liệu `localStorage/IndexedDB` có thể bị xoá sau **~7 ngày không dùng**; **ứng dụng đã thêm vào Màn hình chính thì không bị** → banner cảnh báo + Xuất save (D-09).
- **Rung:** `navigator.vibrate` chủ yếu **Android/Chromium**; iOS bỏ qua → dùng phản hồi hình ảnh (`INP-06`).
- Kiểm chứng lại các điểm trên trên **máy thật** trước khi phát hành (hành vi trình duyệt thay đổi theo phiên bản).

### 23.3 Hệ thống Save
Khoá `localStorage` (đều có tiền tố `ashbound.v1.`): `meta` (tiến trình, mở khóa, Mastery, tiến độ mở khóa, achievement, thống kê) · `settings` · `run` (autosave run hiện tại) · mỗi khoá có biến thể `.bak` và `.tmp`.
- `[SAVE-01]` **Bao gói:** `{ "ver":1, "t":<ms>, "h":"<fnv1a32 hex của chuỗi d>", "d":"<chuỗi JSON của dữ liệu>" }` — `d` lưu **dạng chuỗi** để checksum chính xác từng byte (xem §25.7).
- `[SAVE-02]` **Ghi an toàn:** ghi `key.tmp` → đọc lại & kiểm `h` → copy `key` cũ sang `key.bak` → ghi `key` → xoá `.tmp`. **Đọc:** `key` (kiểm h) → `.bak` → `.tmp` → khởi tạo mới + thông báo (không âm thầm xoá).
- `[SAVE-03]` **Ngân sách:** `meta` ≤ 150 KB, `run` ≤ 60 KB. Mọi ghi `try/catch` (đầy bộ nhớ/ chế độ riêng tư → báo lỗi, gợi ý Xuất save).
- `[RUN-01]` **Autosave run** tại: vào phòng mới (trước khi sinh dữ liệu phòng), dọn xong phòng, nhặt/mua đồ, Pause, `visibilitychange→hidden`, `pagehide`. Nội dung: `seed, class, weapon, aspect, heat, mutators, biomeIdx, nodePath[], hintFlags, roomsVisited, player{hp,maxHpBase,flask,flaskMax,surge,gold,rank,runes[],relics{id:stack},consumables[],curses[],blessings[{id,roomsLeft}],voidKeys,luckBase}, lootRngState[4], pityCounter, runStats{...}, elapsedSim, retryCount, inRoom`.
- `[RUN-02]` Không lưu trạng thái giữa phòng (vị trí/HP địch). Tải lại giữa phòng → **vào lại đầu phòng đó** với HP/đồ như lúc *vào phòng*; `retryCount++` (hiển thị ở Tổng kết). **Hardcore:** thoát giữa phòng = **bỏ cuộc** (kết thúc run).
- `[SAVE-04]` **Migration:** `ver` số nguyên, `migrations[n]` chạy tuần tự; `ver` mới hơn app → **không ghi đè**, chỉ cho Xuất.
- `[SAVE-05]` **Persistent storage:** gọi `navigator.storage.persist()` sau lần kết thúc run đầu tiên; lưu kết quả vào settings.
- `[SAVE-06]` **Xuất/Nhập save:** Xuất = JSON → (nếu có `CompressionStream`) gzip → base64url, tiền tố `ASHSAVE1:`; nút **Tải file `.ashsave`** + **Sao chép mã**. Nhập = dán mã/chọn file ≤ **1 MB** → giải mã → **validate schema** (§23.4) → hiện bản tóm tắt (Tàn Hồn, Mastery, #mở khóa) → xác nhận → sao lưu bản cũ sang `.bak` rồi ghi.

### 23.4 Bảo mật & chống gian lận (tương xứng game offline 1 người)
- **Mô hình:** không thể chặn người chơi tự sửa dữ liệu local → **mục tiêu**: (1) chống hỏng/mất dữ liệu, (2) chống tấn công qua dữ liệu nhập (XSS, prototype pollution), (3) giữ bảng xếp hạng local **công bằng bằng nhãn**.
- `[SEC-01]` **Checksum** FNV-1a phát hiện hỏng/chỉnh sửa. Sai checksum ⇒ nạp được nhưng đặt `tainted=true`: **không** tính achievement/bảng xếp hạng (hiện nhãn). *Không* giả vờ có chữ ký bí mật phía client (có thể bị lấy ra).
- `[SEC-02]` **Không** gắn state ra `window`; build `esbuild --format=iife`. Công cụ debug chỉ có khi build `DEV` (bị loại ở bản phát hành).
- `[SEC-03]` **CSP** (thẻ `<meta>`): `default-src 'none'; script-src 'sha256-<hash script nội tuyến>'; style-src 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; manifest-src 'self'; worker-src 'self'; base-uri 'none'; form-action 'none'`. Build tính hash script và chèn tự động. (Nếu host cho header, thêm `frame-ancestors 'none'`.)
- `[SEC-04]` **Không** `eval`/`new Function`/`innerHTML` với chuỗi từ ngoài; chuỗi người chơi/Seed/Save hiển thị bằng **`textContent`**. Tham số Seed Link & file save: **whitelist khoá**, ép kiểu, **kẹp số** (`clamp`), độ dài chuỗi ≤64, mọi `id` phải tồn tại trong registry; `JSON.parse` xong **sao chép từng trường** vào object mới (`Object.create(null)`), **cấm** `Object.assign` từ dữ liệu ngoài; chặn khoá `__proto__`, `constructor`, `prototype`.
- `[SEC-05]` **Riêng tư:** không cookie, không telemetry, không request bên thứ ba. **Nhật ký lỗi cục bộ** (20 lỗi gần nhất) xem/xuất được trong Cài đặt.
- `[SEC-06]` Nếu **sau này** thêm bảng xếp hạng online: bắt buộc **server xác minh replay** (log input + sim tất định); không tin điểm do client gửi (v1.2+).


---

## 24. Kiến trúc kỹ thuật

### 24.1 Stack & Build
- **Ngôn ngữ:** JavaScript ES2020 (ES modules khi dev), **không** framework/engine/thư viện ngoài. Kiểu dữ liệu ghi bằng **JSDoc** (`@typedef`), kiểm bằng `tsc --checkJs --noEmit` (tuỳ chọn).
- **Build:** `Node 20+`, **esbuild**: `esbuild src/main.js --bundle --minify --format=iife --target=chrome80,safari14,firefox78 --define:DEV=false`. Script `build.mjs`: (1) bundle JS, (2) minify CSS, (3) **inline** JS + CSS + dữ liệu + i18n + atlas (base64) vào `index.html`, (4) tính **SHA-256 của script nội tuyến** chèn vào CSP (`SEC-03`), (5) sinh `sw.js` từ `sw.template.js` với `BUILD` = hash nội dung, (6) copy `manifest.webmanifest` + `icons/`, (7) in kích thước (cảnh báo nếu >1.5 MB).
- **Dev:** `esbuild --serve --watch`, `?dev=1` bật overlay debug (FPS/ms/số entity/seed/trạng thái RNG), phím tắt cheat (giết hết, +vàng, qua phòng, đặt Heat). Bản **release** loại sạch code DEV (`DEV=false` + dead-code elimination).
- **Lint cứng:** ESLint `no-restricted-globals`/`no-restricted-properties` cấm `Math.random`, `Date.now`, `performance.now`, `Math.sin|cos|atan2|pow|exp|hypot` **trong `src/sim/**`**; cấm import `render/`, `audio/`, `ui/` từ `sim/` (sim **không** biết DOM/Canvas/Audio — để chạy được trong Node).

### 24.2 Cấu trúc thư mục
```
ashbound/
├─ src/
│  ├─ main.js                 # boot, vòng lặp, state machine màn hình
│  ├─ core/    rng.js mathx.js bus.js pool.js save.js settings.js i18n.js time.js
│  ├─ sim/     # THUẦN: không DOM/Canvas/Audio, tất định (DET-01)
│  │   world.js player.js enemy.js ai.js boss.js projectile.js status.js reaction.js
│  │   damage.js skills.js weapons.js relics.js hazards.js loot.js economy.js run.js
│  │   gen/ graph.js rooms.js patterns.js validate.js
│  ├─ data/    # dữ liệu thuần (JS/JSON) — 90% nội dung nằm ở đây
│  │   classes.js weapons.js relics.js enemies.js bosses.js events.js shrines.js consumables.js
│  │   curses.js mutators.js heat.js tree.js achievements.js palettes.js sfx.js music.js balance.js
│  ├─ render/  canvas.js forge.js atlas.js tiles.js telegraph.js vfx.js lighting.js camera.js numbers.js
│  ├─ audio/   ctx.js sfx.js music.js
│  ├─ ui/      dom.js hud.js touch.js screens/{hub,setup,pause,map,choice,shop,event,summary,codex,settings}.js
│  ├─ i18n/    vi.json en.json
│  └─ tools/   (DEV) debug-overlay.js bot.js dps-dummy.js seed-explorer.js validate-content.js
├─ public/     manifest.webmanifest  icons/  sw.template.js
├─ assets/     atlas.png atlas.json            # Tier B (tuỳ chọn)
├─ test/       rng.test.js damage.test.js gen.test.js save.test.js content.test.js
├─ build.mjs   package.json                   # scripts: dev, build, test, validate, sim
```
- `[ARC-01]` **Sim ↔ Render tách tuyệt đối:** sim phát **snapshot** (mảng typed + danh sách sự kiện cosmetic: hit-flash, âm, hạt); render chỉ đọc. Nhờ đó chạy **headless trong Node** cho test/bot/balance (`npm run sim`).
- `[ARC-02]` **Data-driven:** thêm relic/enemy/event = thêm 1 object vào `data/*.js` (+ chuỗi i18n); `validate-content.js` chặn build nếu sai (xem §27.2).
- `[ARC-03]` **Dùng chung hình dạng cho vẽ & trúng đòn:** mỗi đòn có 1 struct `shape` (`cone|circle|ring|line|beam`); renderer vẽ telegraph **từ chính struct đó** và sim hit-test **bằng chính struct đó** ⇒ telegraph luôn khớp vùng sát thương (`TEL-03`).

### 24.3 Ngân sách hiệu năng (cứng — vượt là bug)
| Tài nguyên | Cap |
|---|---|
| Địch sống | **24** (+ minion boss ≤ 6) |
| Đạn | **320** (địch ≤200, người chơi ≤120) |
| Hạt | **400** (Chất lượng Thấp: 150) |
| Số sát thương | **40** |
| Nguồn sáng | **8** (Thấp: 0) |
| `drawImage`/frame | ≤ **450** |
| Thời gian/frame (máy tầm trung) | `update` ≤ **4 ms**, `render` ≤ **6 ms**, tổng ≤ **10 ms**; p95 ≤ **16.7 ms** |
| Cấp phát trong `update/render` | **0** (không `{}`/`[]`/closure/`map`/`forEach`/`Object.keys` trong vòng nóng) |
| Heap | ≤ **120 MB**; cache sprite + atlas ≤ **24 MB** |
| Tải | `index.html` ≤ **1.5 MB** (gzip ≤ 500 KB), TTI ≤ **3 s** trên 4G |
- `[PERF-01]` **Chất lượng tự động:** EMA thời gian frame (60 frame). `>18 ms` liên tục **2s** → hạ 1 mức (Cao→Vừa: hạt ×0.5, ánh sáng 4 nguồn; Vừa→Thấp: hạt ×0.25, tắt ánh sáng/bóng mềm, shake ×0.5). `<11 ms` liên tục **10s** → nâng 1 mức, **không vượt mức người chơi chọn**.
- `[PERF-02]` `getContext('2d', { alpha:false, desynchronized:true })`, `imageSmoothingEnabled=false`, vẽ toạ độ **số nguyên** (`x|0`). Nền phòng **bake 1 lần**. Cấm `shadowBlur`/`filter`.
- `[PERF-03]` HUD DOM cập nhật **theo cờ dirty** trong `rAF`, chỉ đổi `transform/opacity/textContent` (không ép layout).
- `[PERF-04]` Va chạm: **spatial hash** ô 32px cho địch/đạn; vòng-tròn vs lưới ô cho tường (trượt theo trục). Nón/quạt kiểm bằng **dot product** (so `cosHalf`), **không** `atan2`.
- `[PERF-05]` Pause khi tab ẩn (`INP-05`); `AudioContext.suspend()` khi ẩn. Chế độ **30 FPS** giữ sim 60Hz, vẽ 30Hz.

### 24.4 Thứ tự một tick mô phỏng
`1 poll input → 2 hitstop/timeScale → 3 player (di chuyển, dash, máy trạng thái đòn) → 4 AI địch + boss (token) → 5 đạn → 6 hazard → 7 va chạm → hàng đợi hit → 8 resolve (pipeline §5.2 → status → reaction → bus relic) → 9 tick status/DoT → 10 spawn/wave → 11 chết, rơi đồ → 12 trạng thái phòng (dọn xong → mở cửa → autosave) → 13 ghi snapshot (prev/cur) cho render`.
- Mọi **hit** đi qua **một hàng đợi** (không gọi sát thương trực tiếp giữa chừng) để thứ tự tất định.

### 24.5 Công cụ phát triển (giảm rủi ro cho dev solo)
| Công cụ | Tác dụng |
|---|---|
| `validate-content` | Kiểm toàn bộ data (xem §27.2) — chạy trong `build` |
| **Seed Explorer** (Node) | Sinh N seed/biome, kiểm hợp lệ, thống kê phân bố loại phòng |
| **Bot headless** (Node) | Chạy sim với bot né-đòn đơn giản → tỉ lệ thắng, DPS, tỉ lệ chết theo biome, win-rate theo relic (§26.3) |
| **Sân Tập** | Dummy đo DPS, spawn địch đã gặp, bật hitbox/telegraph debug |
| Debug overlay | FPS/ms/entity/RNG/seed; vẽ hitbox, shape, token, flow-field |

---

## 25. Schema dữ liệu & Master Code (đã chạy thử)
> Mọi đoạn code dưới đây **đã chạy qua bộ test** (`node test.mjs`: RNG tất định, sai số toán, ví dụ tính tay pipeline, **50.000 đồ thị biome**, **14.400 phòng**, ghi/đọc/phục hồi save, pool, nón/token) — xem §25.12. Comment tiếng Việt, tên API ổn định. Chép vào `src/` rồi nối dây.

### 25.1 RNG & toán tất định — `core/rng.js`
```js
// ===== core/rng.mjs — RNG tất định (32-bit) + toán học không phụ thuộc engine =====
// Dùng cho MỌI thứ ảnh hưởng mô phỏng. Cấm Math.random/Date.now trong /src/sim (DET-01).

// Băm chuỗi -> 4 số 32-bit (cyrb128)
export function cyrb128(str) {
  let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  h1 ^= h2 ^ h3 ^ h4; h2 ^= h1; h3 ^= h1; h4 ^= h1;
  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
}

export class Rng {
  constructor(seedStr) {
    const s = cyrb128(seedStr);
    this.a = s[0]; this.b = s[1]; this.c = s[2]; this.d = s[3];
    for (let i = 0; i < 12; i++) this.next(); // "làm nóng" trạng thái
  }
  // sfc32: trả về float trong [0,1)
  next() {
    this.a >>>= 0; this.b >>>= 0; this.c >>>= 0; this.d >>>= 0;
    let t = (this.a + this.b) | 0;
    this.a = this.b ^ (this.b >>> 9);
    this.b = (this.c + (this.c << 3)) | 0;
    this.c = (this.c << 21) | (this.c >>> 11);
    this.d = (this.d + 1) | 0;
    t = (t + this.d) | 0;
    this.c = (this.c + t) | 0;
    return (t >>> 0) / 4294967296;
  }
  int(min, max) { return min + Math.floor(this.next() * (max - min + 1)); } // gồm cả 2 đầu
  chance(p) { return this.next() < p; }
  pick(arr) { return arr[Math.floor(this.next() * arr.length)]; }
  // items: mảng; wf(item) -> trọng số >= 0. Trả về item, hoặc null nếu tổng = 0
  weighted(items, wf) {
    let total = 0;
    for (let i = 0; i < items.length; i++) total += wf(items[i]);
    if (total <= 0) return null;
    let r = this.next() * total;
    for (let i = 0; i < items.length; i++) { r -= wf(items[i]); if (r < 0) return items[i]; }
    return items[items.length - 1];
  }
  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) { const j = this.int(0, i); const t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
    return arr;
  }
  getState() { return [this.a >>> 0, this.b >>> 0, this.c >>> 0, this.d >>> 0]; } // lưu vào autosave (loot)
  setState(s) { this.a = s[0]; this.b = s[1]; this.c = s[2]; this.d = s[3]; }
}

// 5 stream độc lập theo GEN-01. seed dạng "ASH-XXXX-XXXX"
export function makeStreams(seed) {
  return {
    gen:    (biomeIdx) => new Rng(`${seed}|gen|${biomeIdx}`),
    combat: (roomId)   => new Rng(`${seed}|combat|${roomId}`),
    event:  (roomId)   => new Rng(`${seed}|event|${roomId}`),
    loot:   new Rng(`${seed}|loot`),                 // 1 stream cho cả run
  };
}

// Seed người chơi: Crockford Base32, bỏ I L O U; I/L -> 1, O -> 0
const B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
export function seedFromEntropy(randFn) { // randFn: () => [0,1)  (chỉ dùng ngoài sim, vd Math.random)
  let s = '';
  for (let i = 0; i < 8; i++) s += B32[Math.floor(randFn() * 32)];
  return `ASH-${s.slice(0, 4)}-${s.slice(4)}`;
}
export function normalizeSeed(input) {
  const t = String(input).toUpperCase().replace(/[^0-9A-Z]/g, '').replace(/[IL]/g, '1').replace(/O/g, '0');
  const body = t.startsWith('ASH') ? t.slice(3) : t;
  if (body.length !== 8 || /[^0-9A-HJKMNP-TV-Z]/.test(body)) return null;
  return `ASH-${body.slice(0, 4)}-${body.slice(4)}`;
}

// ---- Toán học tất định: chỉ dùng + - * / sqrt floor abs (đều chính xác theo IEEE-754) ----
export const PI = 3.141592653589793, TAU = 6.283185307179586, HALF_PI = 1.5707963267948966;
export function fsin(x) {
  x = x - TAU * Math.floor((x + PI) / TAU);                    // đưa về [-PI, PI)
  const y = 1.2732395447351628 * x - 0.40528473456935109 * x * Math.abs(x); // parabol (4/PI, 4/PI^2)
  return 0.225 * (y * Math.abs(y) - y) + y;                    // hiệu chỉnh, sai số < 0.001
}
export function fcos(x) { return fsin(x + HALF_PI); }
export function fatan2(y, x) {
  if (x === 0 && y === 0) return 0;
  const ax = Math.abs(x), ay = Math.abs(y);
  const a = (ax < ay ? ax : ay) / (ax > ay ? ax : ay);
  const s = a * a;
  let r = ((-0.0464964749 * s + 0.15931422) * s - 0.327622764) * s * a + a; // sai số ~1e-4 rad
  if (ay > ax) r = HALF_PI - r;
  if (x < 0) r = PI - r;
  if (y < 0) r = -r;
  return r;
}
// Hệ số ENM-01 viết sẵn (tránh Math.pow trong sim)
export const HP_MULT  = [1, 1.45, 2.1025, 3.048625, 4.42050625];       // Biome 1..5
export const DMG_MULT = [1, 1.22, 1.44, 1.66, 1.88];
```

### 25.2 Vòng lặp cố định 60Hz & vòng đời — `main.js`
```js
// ===== main.js (trích) — vòng lặp cố định 60Hz + nội suy render (D-05) =====
const STEP = 1000 / 60;
export function startLoop(game, render, opts = { fps30: false }) {
  let last = performance.now(), acc = 0, skip = false;
  function frame(now) {
    requestAnimationFrame(frame);
    let dt = now - last; last = now;
    if (dt > 100) dt = STEP;                 // tab treo/quay lại: bỏ qua, không "tua" mô phỏng
    acc += dt * game.timeScale;              // timeScale <1 = slow-mo (parry, kill boss); là trạng thái sim
    let steps = 0;
    while (acc >= STEP && steps < 5) {       // chặn "spiral of death": tối đa 5 tick/frame
      game.update();                         // LUÔN dt = 1/60, đọc input đúng 1 lần/tick (INP-03)
      acc -= STEP; steps++;
    }
    if (steps === 5) acc = 0;
    if (opts.fps30) { skip = !skip; if (skip) return; }   // chế độ tiết kiệm pin: vẫn sim 60Hz, vẽ 30Hz
    render(acc / STEP);                      // alpha ∈ [0,1): vị trí vẽ = lerp(prev, cur, alpha)
  }
  requestAnimationFrame(frame);
}
// Quản lý ẩn/hiện tab (INP-05)
export function bindLifecycle(game) {
  const stop = () => { game.pause('hidden'); game.autosave(); };
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  addEventListener('pagehide', stop);
  addEventListener('blur', () => game.pause('blur'));
}
```

### 25.3 Pipeline sát thương — `sim/damage.js`
```js
// ===== sim/damage.mjs — Pipeline sát thương người chơi -> địch (DMG-01..06) =====
// a: chỉ số người chơi đã gộp   { atkPct, atkMore, critChance, critDmg, elemBonus:{fire:0.1,...} }
// t: mục tiêu                   { armor, resist:{fire:0.25,...} }
// h: gói đòn                    { base, mult, elem, typeBonus, isDot, isHeavy, poiseMult, critBonus }
export function resolveHit(a, t, h, rng, biomeIdx) {
  const rawPreCrit = h.base * h.mult * (1 + a.atkPct + (h.typeBonus || 0)) * a.atkMore;   // DMG-01
  let raw = rawPreCrit, crit = false;
  if (!h.isDot && rng.next() < a.critChance + (h.critBonus || 0)) {                       // DMG-02 (DoT không crit)
    raw *= a.critDmg; crit = true;
  }
  const elem = h.elem || 'physical';
  const e = raw * (1 + ((a.elemBonus && a.elemBonus[elem]) || 0)) * (1 - ((t.resist && t.resist[elem]) || 0)); // DMG-03
  const armor = t.armor > 0 ? t.armor : 0;
  const mit = h.isDot ? 0 : Math.min(0.75, armor / (armor + 60 + 12 * biomeIdx));         // DMG-04 (DoT bỏ qua Armor)
  const dmg = Math.max(1, Math.round(e * (1 - mit)));                                      // DMG-05
  return {
    dmg, crit,
    poise: dmg * (h.poiseMult || 1) * (h.isHeavy ? 2 : 1),                                 // DMG-06
    snap: rawPreCrit,                                                                      // DMG-10: Raw trước crit để áp DoT
  };
}
// DMG-11: địch -> người chơi. barrier trừ trước HP. Trả về sát thương thực vào HP.
export function hitPlayer(p, enemyDmg, dmgMult, biomeIdx, heatMult) {
  const armor = p.armor > 0 ? p.armor : 0;
  const mit = Math.min(0.75, armor / (armor + 60 + 12 * biomeIdx));
  let d = Math.max(1, Math.round(enemyDmg * dmgMult * heatMult * (1 - mit)));
  if (p.barrier > 0) { const ab = Math.min(p.barrier, d); p.barrier -= ab; d -= ab; }
  p.hp -= d;
  return d;
}
// DoT mỗi tick: tickPct = 0.12 (Burn) ... ; snap lấy từ từng stack (DMG-10)
export function dotTick(stacks, perSecPct, tickSec, resist) {
  let sum = 0;
  for (let i = 0; i < stacks.length; i++) sum += stacks[i].snap * perSecPct * tickSec;
  return Math.max(1, Math.round(sum * (1 - (resist || 0))));
}
```

### 25.4 Sinh màn: đồ thị + phòng — `sim/gen/*.js`
Đồ thị dùng **cạnh đơn điệu** (staircase) ⇒ không cắt nhau, mọi node có vào/ra, out-degree ≤3 (đã kiểm trên 50.000 biome). Phòng: thử pattern → `validateRoom` → thử lại ≤10 → fallback `open`.
```js
// ===== sim/gen/gen.mjs — Đồ thị biome 7 layer + sinh phòng (GEN-02..09) =====
// Mã ô: 0 sàn, 1 tường, 2 cột/bia, 3 hazard (đi được nhưng gây hại)

// --- Đồ thị: kích thước layer [1,n2,n3,n4,n5,1,1]; cạnh đơn điệu => KHÔNG cắt nhau, mọi node có vào/ra ---
export function genBiomeGraph(rng) {
  const sizes = [1];
  for (let i = 0; i < 4; i++) sizes.push(rng.chance(0.45) ? 3 : 2);
  sizes.push(1, 1);
  const layers = sizes.map((n, L) => {
    const arr = [];
    for (let i = 0; i < n; i++) arr.push({ id: `${L + 1}.${i}`, layer: L + 1, idx: i, type: 'combat', out: [], inn: [] });
    return arr;
  });
  for (let L = 0; L < 6; L++) {
    const A = layers[L], B = layers[L + 1];
    let i = 0, j = 0;
    const link = () => { A[i].out.push(B[j]); B[j].inn.push(A[i]); };
    link();
    while (i < A.length - 1 || j < B.length - 1) {
      let move;                                   // 0: i++, 1: j++, 2: cả hai
      if (i === A.length - 1) move = 1;
      else if (j === B.length - 1) move = 0;
      else move = rng.int(0, 2);
      if (move === 0 || move === 2) i++;
      if (move === 1 || move === 2) j++;
      link();
    }
  }
  return { layers };
}

// --- Gán loại node (STR-01..07). Trả true nếu hợp lệ; thử lại tối đa 10 lần rồi fallback tất định ---
export function assignTypes(g, biome, rng) {
  const L = g.layers;
  const mid = [].concat(L[1], L[2], L[3], L[4]);            // L2..L5
  for (let tries = 0; tries < 10; tries++) {
    mid.forEach(n => { n.type = 'combat'; });
    L[5][0].type = 'rest'; L[6][0].type = 'boss'; L[0][0].type = 'combat';
    const place = (type, layerMin, layerMax) => {
      const cands = mid.filter(n => n.type === 'combat' && n.layer >= layerMin && n.layer <= layerMax);
      if (!cands.length) return false;
      rng.pick(cands).type = type; return true;
    };
    place('shop', 3, 5);
    place('event', 2, 5);
    const elites = biome === 1 ? 1 : rng.int(1, 2);
    for (let k = 0; k < elites; k++) place('elite', 4, 5);
    if (rng.chance(0.5)) place('shrine', 2, 5);
    if (rng.chance(0.4)) place('treasure', 2, 5);
    if (validateTypes(g)) return true;
  }
  return fallbackTypes(g);
}
export function validateTypes(g) {
  const all = [].concat(...g.layers);
  const count = t => all.filter(n => n.type === t).length;
  if (count('shop') < 1 || count('event') < 1 || count('elite') > 2) return false;
  for (const n of all) for (const m of n.out) {                       // không Shop/Elite nối trực tiếp nhau (STR-02)
    const heavy = x => x.type === 'shop' || x.type === 'elite';
    if (heavy(n) && heavy(m)) return false;
  }
  for (const layer of g.layers) if (layer.filter(n => n.type === 'shop').length > 1) return false;
  return true;
}
export function fallbackTypes(g) {                                    // luôn hợp lệ
  const L = g.layers;
  [].concat(L[1], L[2], L[3], L[4]).forEach(n => { n.type = 'combat'; });
  // Shop ở L3, Event ở L2, Elite ở L5: cách nhau ≥2 layer nên KHÔNG BAO GIỜ kề nhau => luôn hợp lệ
  L[2][0].type = 'shop'; L[1][0].type = 'event'; L[4][0].type = 'elite';
  return validateTypes(g);
}

// --- Phòng ---
export function makeGrid(W, H) { return { W, H, t: new Uint8Array(W * H) }; }
export function exitRows(H, n) {
  if (n === 1) return [Math.floor(H / 2)];
  if (n === 2) return [Math.floor(H * 0.25), Math.floor(H * 0.75)];
  return [Math.floor(H * 0.15), Math.floor(H / 2), Math.floor(H * 0.85)];
}
function safe(room, x, y) {                                           // vùng 5×5 trước cửa vào/ra luôn trống
  const cy = Math.floor(room.H / 2);
  if (x < 5 && Math.abs(y - cy) <= 2) return true;
  for (const ey of room.exits) if (x >= room.W - 5 && Math.abs(y - ey) <= 2) return true;
  return false;
}
const PATTERNS = {
  open(room, rng) {
    const n = rng.int(0, 3);
    for (let k = 0; k < n; k++) { const x = rng.int(6, room.W - 7), y = rng.int(2, room.H - 3); if (!safe(room, x, y)) room.t[y * room.W + x] = 2; }
  },
  pillars_grid(room) {
    let row = 0;
    for (let y = 3; y < room.H - 2; y += 6, row++)
      for (let x = 6 + (row % 2) * 3; x < room.W - 6; x += 6) if (!safe(room, x, y)) room.t[y * room.W + x] = 2;
  },
  cover_walls(room, rng) {
    const n = rng.int(4, 6), placed = [];
    for (let tries = 0; tries < 60 && placed.length < n; tries++) {
      const len = rng.int(3, 4), horiz = rng.chance(0.5);
      const w = horiz ? len : 1, h = horiz ? 1 : len;
      const x0 = rng.int(2, room.W - 3 - w), y0 = rng.int(2, room.H - 3 - h);
      let ok = true;
      for (let y = y0 - 2; y < y0 + h + 2 && ok; y++) for (let x = x0 - 2; x < x0 + w + 2; x++) {  // cách tường khác ≥3 ô
        if (x < 0 || y < 0 || x >= room.W || y >= room.H) continue;
        if (room.t[y * room.W + x] !== 0) { ok = false; break; }
      }
      for (let y = y0; y < y0 + h && ok; y++) for (let x = x0; x < x0 + w; x++) if (safe(room, x, y)) { ok = false; break; }
      if (!ok) continue;
      for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) room.t[y * room.W + x] = 1;
      placed.push(1);
    }
  },
  scatter(room, rng) {
    const cap = Math.floor(room.W * room.H * 0.06);
    let count = 0;
    for (let tries = 0; tries < 300 && count < cap; tries++) {
      const x = rng.int(2, room.W - 3), y = rng.int(2, room.H - 3);
      if (safe(room, x, y) || room.t[y * room.W + x] !== 0) continue;
      let ok = true;
      for (let yy = y - 4; yy <= y + 4 && ok; yy++) for (let xx = x - 4; xx <= x + 4; xx++) {
        if (xx < 0 || yy < 0 || xx >= room.W || yy >= room.H) continue;
        if (room.t[yy * room.W + xx] === 2) { ok = false; break; }
      }
      if (ok) { room.t[y * room.W + x] = 2; count++; }
    }
  },
};
export const PATTERN_NAMES = Object.keys(PATTERNS);

// Kiểm hợp lệ (GEN-08): flood-fill chạm mọi cửa ra + ≥90% ô đi được; mọi ô có khối 2×2 trống (hành lang ≥2)
export function validateRoom(room) {
  const { W, H, t } = room, cy = Math.floor(H / 2);
  const walk = (x, y) => x >= 0 && y >= 0 && x < W && y < H && t[y * W + x] !== 1 && t[y * W + x] !== 2;
  if (!walk(0, cy)) return false;
  const seen = new Uint8Array(W * H), stack = [0, cy]; seen[cy * W] = 1;
  let reached = 1;
  while (stack.length) {
    const y = stack.pop(), x = stack.pop();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (walk(nx, ny) && !seen[ny * W + nx]) { seen[ny * W + nx] = 1; reached++; stack.push(nx, ny); }
    }
  }
  for (const ey of room.exits) if (!seen[ey * W + (W - 1)]) return false;
  let total = 0;
  for (let i = 0; i < W * H; i++) if (t[i] !== 1 && t[i] !== 2) total++;
  if (reached < 0.9 * total) return false;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!seen[y * W + x]) continue;
    let wide = false;
    for (let oy = -1; oy <= 0 && !wide; oy++) for (let ox = -1; ox <= 0; ox++)
      if (walk(x + ox, y + oy) && walk(x + ox + 1, y + oy) && walk(x + ox, y + oy + 1) && walk(x + ox + 1, y + oy + 1)) { wide = true; break; }
    if (!wide) return false;
  }
  return true;
}

// GEN-09: thử tối đa 10 lần với seed phụ, rồi fallback `open` không vật cản (luôn hợp lệ)
export function genRoom(W, H, nExits, patternName, mkRng /* (retry)=>Rng */) {
  for (let retry = 0; retry < 10; retry++) {
    const rng = mkRng(retry);
    const room = Object.assign(makeGrid(W, H), { exits: exitRows(H, nExits), pattern: patternName });
    PATTERNS[patternName](room, rng);
    if (validateRoom(room)) return room;
  }
  const room = Object.assign(makeGrid(W, H), { exits: exitRows(H, nExits), pattern: 'open', fallback: true });
  return room;
}
```

**Template/Chunk vẽ tay (tuỳ chọn, polish):** thêm vào thư viện, `validateRoom` vẫn kiểm. Định dạng ASCII (chunk 10×7, mép nối mở ở giữa để luôn thông):
```text
# id: b1_cover_a | biome: [1] | size: 10x7 | weight: 2 | tags: [cover]
##########        # tường   .  sàn   P  cột   S  gai   X  vũng độc
....PP....        # L  dung nham   ~  nước nông   W  nước sâu   v  dây leo
....PP....        # Hàng giữa (y=3) và cột giữa (x=4,5) phải là '.' ở mép chunk để nối
.#......#.
..........
.#......#.
..........
##########
```
Ghép phòng = lưới chunk (30×14 = 3×2 chunk; 40×21 = 4×3 chunk; chunk nào đè vùng an toàn cửa → thay `open`).

### 25.5 Pool đạn SoA — `core/pool.js`
```js
// ===== core/pool.mjs — Pool đạn SoA (0 cấp phát trong vòng lặp nóng) =====
export class ProjPool {
  constructor(n = 320) {
    this.n = n;
    this.alive = new Uint8Array(n);
    this.px = new Float32Array(n); this.py = new Float32Array(n);   // vị trí hiện tại
    this.qx = new Float32Array(n); this.qy = new Float32Array(n);   // vị trí tick trước (để nội suy render)
    this.vx = new Float32Array(n); this.vy = new Float32Array(n);   // px/tick
    this.r = new Float32Array(n); this.life = new Int16Array(n);
    this.dmg = new Float32Array(n); this.owner = new Uint8Array(n); // 0 người chơi, 1 địch
    this.pierce = new Int8Array(n); this.kind = new Uint8Array(n);
    this.free = new Int16Array(n); this.top = n;
    for (let i = 0; i < n; i++) this.free[i] = n - 1 - i;
  }
  spawn(x, y, vx, vy, r, life, dmg, owner, pierce, kind) {
    if (this.top === 0) return -1;                  // hết chỗ -> bỏ (cap cứng, PERF)
    const i = this.free[--this.top];
    this.alive[i] = 1;
    this.px[i] = this.qx[i] = x; this.py[i] = this.qy[i] = y;
    this.vx[i] = vx; this.vy[i] = vy; this.r[i] = r; this.life[i] = life;
    this.dmg[i] = dmg; this.owner[i] = owner; this.pierce[i] = pierce; this.kind[i] = kind;
    return i;
  }
  kill(i) { if (!this.alive[i]) return; this.alive[i] = 0; this.free[this.top++] = i; }
  step() {                                          // gọi 1 lần/tick
    for (let i = 0; i < this.n; i++) {
      if (!this.alive[i]) continue;
      this.qx[i] = this.px[i]; this.qy[i] = this.py[i];
      this.px[i] += this.vx[i]; this.py[i] += this.vy[i];
      if (--this.life[i] <= 0) this.kill(i);
    }
  }
}
```

### 25.6 Input cảm ứng — `ui/touch.js`
```js
// ===== ui/touch.js — Pointer Events: joystick nổi + nút (CTL-01, INP-02/03) =====
// Handler CHỈ ghi cờ. Sim gọi poll() đúng 1 lần/tick và nhận ảnh chụp bất biến.
const ACTS = ['atk', 'heavy', 'dash', 'q', 'e', 'r', 'flask'];
export class Input {
  constructor(zoneEl, getR /* () => bán kính joystick px (đã nhân buttonScale) */) {
    this.R = getR; this.zone = zoneEl;
    this.joy = { id: -1, ox: 0, oy: 0, cx: 0, cy: 0 };
    this.mx = 0; this.my = 0;                       // int8 [-127..127] (dễ ghi log/replay)
    this.down = {}; this.edge = {};
    for (const a of ACTS) { this.down[a] = false; this.edge[a] = false; }
    this.ptr = new Map();                           // pointerId -> tên nút
    this._bindJoystick();
  }
  bindButton(el, act) {                             // gọi cho từng nút DOM có data-act
    el.addEventListener('pointerdown', e => {
      e.preventDefault(); el.setPointerCapture(e.pointerId);
      this.ptr.set(e.pointerId, act); if (!this.down[act]) this.edge[act] = true; this.down[act] = true;
    });
    const up = e => { if (this.ptr.get(e.pointerId) === act) { this.ptr.delete(e.pointerId); this.down[act] = false; } };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);   // pointercancel: bắt buộc xử lý
    el.addEventListener('lostpointercapture', up);
  }
  _bindJoystick() {
    const z = this.zone, j = this.joy;
    z.addEventListener('pointerdown', e => {
      if (j.id !== -1) return;                      // chỉ 1 ngón cho joystick
      e.preventDefault(); z.setPointerCapture(e.pointerId);
      j.id = e.pointerId; j.ox = j.cx = e.clientX; j.oy = j.cy = e.clientY;
    });
    z.addEventListener('pointermove', e => {
      if (e.pointerId !== j.id) return;
      const R = this.R(); j.cx = e.clientX; j.cy = e.clientY;
      let dx = j.cx - j.ox, dy = j.cy - j.oy, d = Math.sqrt(dx * dx + dy * dy);
      if (d > R) { const k = (d - R) / d; j.ox += dx * k; j.oy += dy * k; dx = j.cx - j.ox; dy = j.cy - j.oy; d = R; } // gốc bị kéo theo ngón
      const dead = 0.12, m = Math.min(1, Math.max(0, (d / R - dead) / (1 - dead)));
      if (m === 0 || d === 0) { this.mx = this.my = 0; return; }
      const k = (0.4 + 0.6 * m) / d;                // tốc độ = 0.4 + 0.6*m (CTL-01)
      this.mx = Math.round(dx * k * 127); this.my = Math.round(dy * k * 127);
    });
    const end = e => { if (e.pointerId === j.id) { j.id = -1; this.mx = this.my = 0; } };
    z.addEventListener('pointerup', end); z.addEventListener('pointercancel', end); z.addEventListener('lostpointercapture', end);
  }
  releaseAll() { this.mx = this.my = 0; this.joy.id = -1; for (const a of ACTS) this.down[a] = this.edge[a] = false; this.ptr.clear(); } // khi pause/chuyển phòng
  poll() {                                          // 1 lần/tick
    const s = { mx: this.mx, my: this.my, down: Object.assign({}, this.down), edge: Object.assign({}, this.edge) };
    for (const a of ACTS) this.edge[a] = false;
    return s;
  }
}
```

### 25.7 Save an toàn — `core/save.js`
```js
// ===== core/save.mjs — Ghi an toàn + checksum + .bak (SAVE-01..03) =====
export function fnv1a32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(16).padStart(8, '0');
}
const PFX = 'ashbound.v1.';
export class SaveStore {
  constructor(storage) { this.s = storage; }        // vd: window.localStorage
  _wrap(data) {
    const d = JSON.stringify(data);                 // d lưu dạng CHUỖI để checksum chính xác từng byte
    return JSON.stringify({ ver: 1, t: Date.now(), h: fnv1a32(d), d });
  }
  _parse(raw) {                                     // -> { data, ok } | null
    if (!raw) return null;
    let w; try { w = JSON.parse(raw); } catch { return null; }
    if (!w || typeof w.d !== 'string' || typeof w.ver !== 'number') return null;
    let data; try { data = JSON.parse(w.d); } catch { return null; }
    return { data, ok: fnv1a32(w.d) === w.h, ver: w.ver };
  }
  write(key, data) {                                // true/false (không throw)
    const k = PFX + key, raw = this._wrap(data);
    try {
      this.s.setItem(k + '.tmp', raw);
      if (this.s.getItem(k + '.tmp') !== raw) throw new Error('verify');   // đọc lại kiểm tra
      const old = this.s.getItem(k);
      if (old != null) this.s.setItem(k + '.bak', old);
      this.s.setItem(k, raw);
      this.s.removeItem(k + '.tmp');
      return true;
    } catch { return false; }                       // đầy bộ nhớ / chế độ riêng tư -> báo UI, gợi ý Xuất save
  }
  read(key) {                                       // -> { data, recovered, tainted } | null
    const k = PFX + key; let tainted = null;
    for (const suf of ['', '.bak', '.tmp']) {
      let raw = null; try { raw = this.s.getItem(k + suf); } catch { /* bỏ qua */ }
      const p = this._parse(raw);
      if (!p) continue;
      if (p.ok) return { data: p.data, recovered: suf !== '', tainted: false };
      if (!tainted) tainted = p;                    // parse được nhưng sai checksum
    }
    return tainted ? { data: tainted.data, recovered: false, tainted: true } : null;  // SEC-01: nạp nhưng đánh dấu tainted
  }
}
```

### 25.8 Event bus & Registry relic — `sim/relics.js`
Mỗi relic = 1 object `defineRelic`; `install()` đăng ký handler trên bus và trả về hàm huỷ. Giá trị theo stack lấy từ mảng. **Mọi sát thương do relic sinh ra mang `depth`** (`REL-04`).
```js
// ===== sim/relics.mjs — Event bus + Registry relic (REL-01..04) =====
export class Bus {
  constructor() { this.h = Object.create(null); }
  on(ev, fn) { (this.h[ev] || (this.h[ev] = [])).push(fn); return () => { const a = this.h[ev]; a.splice(a.indexOf(fn), 1); }; }
  emit(ev, ctx) { const a = this.h[ev]; if (!a) return; for (let i = 0; i < a.length; i++) a[i](ctx); }
}
export const RELICS = Object.create(null);
export const defineRelic = def => { RELICS[def.id] = def; };

// REL-04: sát thương do relic sinh ra mang depth. depth>=1 KHÔNG kích OnHit/OnCrit; OnKill chấp nhận depth<=2; ICD 6f/mục tiêu
function canProc(ctx, p, relicId, targetId, trigger) {
  const depth = ctx.depth || 0;
  if ((trigger === 'hit' || trigger === 'crit') && depth >= 1) return false;
  if (trigger === 'kill' && depth > 2) return false;
  const key = relicId + ':' + targetId, last = p.icd[key] || -999;
  if (p.tick - last < 6) return false;
  p.icd[key] = p.tick; return true;
}

// --- Ví dụ 1: u02 Lưỡi Lửa (OnDash: vệt lửa 2s; dps 30/40/50% Raw) ---
defineRelic({
  id: 'u02', tags: ['fire', 'dash'], max: 3,
  install(p, bus, w) {
    const pct = [0, 0.30, 0.40, 0.50];
    return [bus.on('dash', ctx => {
      const s = p.relics.u02 | 0; if (!s) return;
      w.spawnTrail({ from: ctx.from, to: ctx.to, life: 120, tick: 30, elem: 'fire', pct: pct[s], snap: p.lastRaw, depth: 1 });
    })];
  },
});
// --- Ví dụ 2: u08 Hạt Giống Lửa (OnKill 25/35/45% nổ r=2t 80% Raw) ---
defineRelic({
  id: 'u08', tags: ['fire', 'aoe'], max: 3,
  install(p, bus, w) {
    const chance = [0, 0.25, 0.35, 0.45];
    return [bus.on('kill', ctx => {
      const s = p.relics.u08 | 0; if (!s || !canProc(ctx, p, 'u08', ctx.target.id, 'kill')) return;
      if (w.rng.chance(chance[s])) w.explode({ x: ctx.target.x, y: ctx.target.y, r: 32, dmgRaw: 0.8 * ctx.snap, elem: 'fire', depth: (ctx.depth || 0) + 1 });
    })];
  },
});
// Gắn mọi relic người chơi đang có (gọi khi nhặt relic mới/đổi stack/khởi tạo từ autosave)
export function installAll(p, bus, w) {
  p.unsub = p.unsub || [];
  p.unsub.forEach(f => f()); p.unsub.length = 0;
  for (const id in p.relics) if (RELICS[id]) p.unsub.push(...RELICS[id].install(p, bus, w));
}
```

### 25.9 AI kẻ địch — `sim/ai.js`
```js
// ===== sim/ai.mjs — FSM kẻ địch + token đánh (AI-01) + hình dạng dùng CHUNG cho telegraph và hit-test (TEL-03) =====
export const ST = { IDLE: 0, ALERT: 1, CHASE: 2, TELE: 3, ATK: 4, REC: 5, STAG: 6, DEAD: 7 };

export class TokenPool {
  constructor(max = 3) { this.max = max; this.used = 0; }
  tryTake() { if (this.used < this.max) { this.used++; return true; } return false; }
  release() { if (this.used > 0) this.used--; }
}

// Hình nón: dir đã chuẩn hoá, cosHalf = cos(arc/2) -> kiểm tra bằng dot product, KHÔNG dùng atan2
export function inCone(s, px, py, pr) {
  const dx = px - s.x, dy = py - s.y, d2 = dx * dx + dy * dy, R = s.r + pr;
  if (d2 > R * R) return false;
  if (d2 < 1e-6) return true;
  const d = Math.sqrt(d2);
  return (dx * s.dx + dy * s.dy) / d >= s.cosHalf;
}
export function inCircle(s, px, py, pr) { const dx = px - s.x, dy = py - s.y, R = s.r + pr; return dx * dx + dy * dy <= R * R; }

// e: { state, t, atk, shape, token, x, y, speed, ... }   w: { player, tokens, setShape(e, atk), hitPlayer(e, atk) }
// atk: { tele, act, rec, kind:'cone'|'circle', r, cosHalf, dmg }  -- đơn vị frame (tele ≥ 24f thường, ≥ 36f elite, ≥ 48f boss)
export function updateEnemy(e, w) {
  const p = w.player;
  switch (e.state) {
    case ST.IDLE: e.state = ST.ALERT; e.t = 12; break;                        // 12f phản ứng
    case ST.ALERT: if (--e.t <= 0) e.state = ST.CHASE; break;
    case ST.CHASE: {
      const dx = p.x - e.x, dy = p.y - e.y, d2 = dx * dx + dy * dy;
      const atk = e.atkList[e.nextAtk];
      if (d2 <= atk.range * atk.range && e.cd <= 0) {
        if (e.hasToken || w.tokens.tryTake()) {                                  // phải có token mới vào Telegraph
          e.hasToken = true; e.state = ST.TELE; e.t = atk.tele; e.cur = atk; w.setShape(e, atk);   // KHOÁ hướng tại frame bắt đầu telegraph
        } else w.repositionAround(e, p);                                         // không có token: giữ vòng 3–6t
      } else w.steerTo(e, p);                                                    // LOS thẳng hoặc flow-field
      if (e.cd > 0) e.cd--;
      break;
    }
    case ST.TELE:                                                               // hình `e.shape` được VẼ và HIT-TEST cùng một struct
      if (--e.t <= 0) { e.state = ST.ATK; e.t = e.cur.act; e.hitDone = false; } break;
    case ST.ATK:
      if (!e.hitDone) { w.hitPlayer(e, e.cur); e.hitDone = true; }               // tối đa 1 lần/đòn (ICD)
      if (--e.t <= 0) { e.state = ST.REC; e.t = e.cur.rec; } break;
    case ST.REC:
      if (--e.t <= 0) {
        e.state = ST.CHASE; e.cd = e.cur.cooldown | 0;
        e.hasToken = false; w.tokens.release();                                  // trả token
        e.nextAtk = (e.nextAtk + 1) % e.atkList.length;
      } break;
    case ST.STAG: if (--e.t <= 0) e.state = ST.CHASE; break;                      // poise vỡ (Elite: ngắt ở REC; Boss: chỉ sau đòn)
  }
}
```

### 25.10 Audio SFX — `audio/sfx.js`
```js
// ===== audio/sfx.js — SFX sinh bằng WebAudio (D-11, AUD-01..02) =====
let ctx = null, sfxBus = null, noiseBuf = null, voices = 0;
export function initAudio() {                       // GỌI TRONG handler của lần chạm đầu tiên (mở khoá iOS/Chrome)
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  const comp = ctx.createDynamicsCompressor(); comp.connect(ctx.destination);
  const master = ctx.createGain(); master.gain.value = 0.8; master.connect(comp);
  sfxBus = ctx.createGain(); sfxBus.gain.value = 0.9; sfxBus.connect(master);
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);                // 1 buffer nhiễu dùng chung
  const ch = noiseBuf.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1; // audio = cosmetic
}
// p: { wave:'square'|'saw'|'sine'|'triangle'|'noise', f0, f1, ms, vol, prio }
export function sfx(p) {
  if (!ctx || voices >= 24) return;                 // AUD-02: tối đa 24 voice
  const t = ctx.currentTime, dur = p.ms / 1000, g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(p.vol, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  g.connect(sfxBus);
  let src;
  if (p.wave === 'noise') {
    src = ctx.createBufferSource(); src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass';
    f.frequency.setValueAtTime(p.f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(20, p.f1 || p.f0), t + dur);
    src.connect(f); f.connect(g);
  } else {
    src = ctx.createOscillator(); src.type = p.wave === 'saw' ? 'sawtooth' : p.wave;
    src.frequency.setValueAtTime(p.f0, t); src.frequency.exponentialRampToValueAtTime(Math.max(20, p.f1 || p.f0), t + dur);
    src.connect(g);
  }
  voices++; src.onended = () => { voices--; g.disconnect(); };
  src.start(t); src.stop(t + dur + 0.02);
}
// Ví dụ: sfx({ wave:'square', f0:880, f1:1320, ms:60, vol:0.25 })  // 'gold'
```

### 25.11 Schema dữ liệu (mẫu — thêm nội dung = thêm object, không sửa code)
```js
// data/weapons.js
{ id:'wpn_ash_sword', cls:'ashblade', type:'melee', unlock:{ kind:'default' },        // 'default' | {kind:'mastery', lv:3}
  dmg:12, poiseMult:1.0, comboReset:30,
  combo:[ { mult:1.0, f:[6,4,8],  arcDeg:100, rT:2.4 },
          { mult:1.0, f:[6,4,8],  arcDeg:100, rT:2.4 },
          { mult:1.4, f:[8,5,14], arcDeg:100, rT:2.4 } ],
  heavy:{ holdF:36, mult:2.2, f:[10,6,18], shape:{ kind:'circle', rT:2.6 }, poiseMult:2, knockbackT:1.5 },
  special:null }

// data/enemies.js  (số quy về Biome 1; hệ số biome áp ở runtime: HP_MULT/DMG_MULT)
{ id:'skel_grunt', arch:'grunt', biome:1, mod:{ hp:1, dmg:1, spd:1 }, threat:2,
  atk:[ { id:'slash2', kind:'cone', arcDeg:90, rT:1.6, range:1.7, tele:30, act:7, rec:18, mult:1.0, color:'red',    cooldown:30,
          chain:{ tele:24, act:7, rec:24, mult:1.0, color:'yellow' } } ] }

// data/bosses.js
{ id:'gorrak', hp:2000, bossDmg:16, armor:30, arena:{ w:40, h:22, pillars:6 }, phases:[1, 0.66, 0.33],
  attacks:[ { id:'g_slam', phaseMin:1, weight:2, group:'wave', tele:[54], color:'purple',
              shape:{ kind:'ring', speedT:7, thickT:0.8, maxRT:12 }, mult:1.2 } ] }

// data/relics.js  (hiệu ứng theo stack; text qua i18n 'item.<id>.name|desc' với {a}/{b}/{c})
{ id:'u08', rarity:'U', tags:['fire','aoe'], max:3, req:null, unlock:'default',
  trigger:'kill', levels:[ { chance:0.25 }, { chance:0.35 }, { chance:0.45 } ], effect:'explode_80' }

// data/events.js
{ id:'evt_gambler', biomes:[1,2,3,4,5], repeatable:false, choices:[
    { id:'x15', cost:{ gold:50 }, roll:{ p:0.60, win:{ goldGain:75 },  lose:{} } },
    { id:'x2',  cost:{ gold:50 }, roll:{ p:0.45, win:{ goldGain:100 }, lose:{} } },
    { id:'x3',  cost:{ gold:50 }, roll:{ p:0.30, win:{ goldGain:150 }, lose:{} } } ] }
```
**Skeleton `run` (autosave, `RUN-01`):**
```json
{ "seed":"ASH-0000-0000", "cls":"ashblade", "weapon":"wpn_ash_sword", "aspect":null, "heat":0, "mutators":[],
  "biome":1, "path":["1.0","2.1"], "hints":{ "secretNext":false }, "rooms":2,
  "p":{ "hp":100, "maxHpBase":100, "flask":2, "flaskMax":2, "surge":0, "gold":42, "rank":1, "runes":[],
        "relics":{ "c01":1 }, "consumables":[], "curses":[], "blessings":[], "voidKeys":0, "luck":0 },
  "lootRng":[0,0,0,0], "pity":0, "stats":{ "kills":0, "hits":0, "time":0 }, "retry":0 }
```

### 25.12 Test vector, golden value & lệnh
| Kiểm | Giá trị phải khớp |
|---|---|
| `new Rng('ASH-0000-0000')` 3 số đầu | `0.96856253  0.40648652  0.40023700` |
| `fnv1a32('ashbound')` | `25835d0d` |
| `HP_MULT` | `1 / 1.45 / 2.1025 / 3.048625 / 4.42050625` |
| Pipeline: `base 12, ATK+8%, armor 0, B1` | **13** · `armor 40` → **8** · crit 100% → **19** · DoT bỏ qua Armor |
| `hitPlayer`: Lính Xương B5 (`10×1.88`), Armor 20, Barrier 10 | Barrier → 0, HP −**6** |
| Sinh map `ASH-0000-0000`, biome 1 | kích thước layer `1,2,3,2,2,1,1` (khớp trên **mọi** trình duyệt) |
| `fsin/fcos` sai số | < **0.002**; `fatan2` < **0.001** |
```
npm run dev        # server + watch
npm test           # node --test (rng, damage, gen 10.000 seed/biome, save, content)
npm run validate   # kiểm dữ liệu & luật telegraph
npm run sim -- --runs 1000 --class all --heat 0     # bot headless: win-rate, DPS, tử vong theo biome
npm run build      # -> dist/ (index.html + sw.js + manifest + icons)
```

---

## 26. Cân bằng & KPI

### 26.1 Mốc sức mạnh (điểm xuất phát — chỉnh bằng sim/playtest, đừng chỉnh bằng cảm tính)
| Biome | DPS người chơi (build trung bình, 100% trúng) | HP Grunt (×`HP_MULT`) | TTK Grunt | HP boss | Thời gian boss (DPS×0.75) | Dmg Grunt (`10×DMG_MULT`) | HP+Barrier người chơi |
|---|---|---|---|---|---|---|---|
| B1 | **30** | 30 | 1.0s | 2.000 | ~89s | 10 | 100–125 |
| B2 | **55** | 43 | 0.8s | 4.200 | ~102s | 12 | 115–145 |
| B3 | **95** | 63 | 0.7s | 7.000 | ~98s | 14 | 130–160 |
| B4 | **160** | 91 | 0.6s | 12.000 | ~100s | 17 | 145–180 |
| B5 | **240** | 133 | 0.6s | 17.500 | ~97s | 19 | 160–200 |
| Vua Tro | **280** | — | — | 28.000 | ~133s | 28 (boss) | 170–220 |
**Mục tiêu:** boss **90–130s**; phòng thường **40–70s**; run **25–40 phút**; 1 đòn trúng Grunt ≈ **5–8% HP** (B5 ~**8–10%**).

### 26.2 KPI mục tiêu (Heat 0)
| Chỉ số | Mục tiêu |
|---|---|
| Thắng run đầu (người mới) | 3–8% |
| Tỉ lệ thắng sau 10 run | 20–30% · người thạo: 55–65% |
| Phân bố nơi chết của người **mới** (chưa thắng) | B1 25% · B2 20% · B3 18% · B4 15% · B5 12% · Vua Tro 10% |
| Số run để mở hết Cây Tàn Lửa | 30–35 |
| Chết do "không đọc được đòn" (phản hồi) | < 10% |
| Thời gian từ mở app tới đánh trúng đòn đầu | **< 20s** |
| p95 frame time (máy chuẩn thấp, phòng nặng nhất) | **≤ 16.7ms** |

### 26.3 Cách cân bằng (có hệ thống)
- Toàn bộ hằng số cân bằng nằm ở `data/balance.js` (nhân HP/dmg theo biome, vàng, tỉ lệ rơi, HP boss, ngưỡng Pity…). **Không** rải số trong code.
- **Bot headless** (`npm run sim`): chạy ≥1.000 run/cấu hình, ghi: win-rate, nơi chết, DPS, thời gian/phòng, **win-rate theo relic** (so với baseline cùng class). Cờ cảnh báo: relic **Common/Uncommon** vượt baseline **>+12%** (quá mạnh) hoặc **<−8%** (quá yếu); Epic/Legendary được phép "gãy có chủ đích" nhưng không vượt **+35%**.
- Bot **không thay người chơi thật**: chỉ dò outlier. Mọi chỉnh cuối dựa **playtest người thật** (§27.3).
- Quy tắc **chỉ đổi 1 biến mỗi lần**, ghi vào `balance-changelog.md` (ngày, đổi gì, vì sao, kết quả sim).

---

## 27. QA & Cổng phát hành

### 27.1 Chiến lược kiểm thử
| Lớp | Nội dung | Công cụ |
|---|---|---|
| **Unit** (Node) | RNG & golden vector · toán tất định · pipeline sát thương (ví dụ tính tay) · **sinh map ≥10.000 seed/biome (0 lỗi)** · **sinh phòng mọi pattern** · save (ghi/đọc/hỏng/đầy bộ nhớ/migration) · pool/cap · cone/token | `node --test` |
| **Content** | `validate-content` (27.2) | script |
| **Sim/Bot** | ≥200 run/class không crash, không kẹt (watchdog: 1 phòng >5 phút sim) | `npm run sim` |
| **Thiết bị thật** | Ma trận 27.4: cảm ứng đa điểm, vòng đời, hiệu năng, âm thanh, PWA | tay + checklist |
| **Truy cập** | Mù màu, giảm nhấp nháy, cỡ chữ/nút, tay trái, Assist | checklist `ACC-*` |
| **Mạng** | DevTools Network: **0 request** khi chơi (trừ link Ủng hộ khi bấm); CSP không báo vi phạm | thủ công + script |

### 27.2 `validate-content` (chặn build nếu sai)
1. Mọi `id` được tham chiếu đều tồn tại (relic trong Evolution, enemy trong biome, chuỗi i18n **đủ VI+EN**).
2. **Telegraph:** đòn địch thường `tele ≥ 24f` · elite `≥ 36f` · boss: `mult ≥ 1.0 → tele ≥ 48f`, `mult < 1.0 → tele ≥ 36f`; chuỗi nhịp sau theo `TEL-09`.
3. Tổng frame đòn hợp lý (`startup+active+recover ≥ 6`), `act ≥ 1`.
4. Số liệu: trọng số/độ hiếm cộng ≈ 100%, giá nằm trong dải, không số âm vô nghĩa, `maxStack ≥ 1`.
5. Mỗi relic có ≥1 tag; tag ∈ 16 tag hợp lệ; `req` ∈ {melee, ranged, null}.
6. Mỗi biome có đủ 7 thường + 1 elite; mỗi boss có ≥1 đòn/phase và 1 đòn `Heat 8`.
7. Kích thước `index.html` ≤ 1.5 MB; không có `Math.random|Date.now` trong `src/sim`.

### 27.3 Playtest
- **Fun gate (cuối M1):** 10 người lạ chơi 1 phòng trên điện thoại thật, **không giải thích** → ≥7/10 muốn chơi tiếp, ≥8/10 hiểu telegraph đỏ. **Chưa qua → không làm tiếp nội dung.**
- Mỗi cột mốc: 5–10 người; đo: chỗ chết, thời gian/phòng, ngón tay bị che màn hình (ảnh chụp), chạm nhầm, cảm giác độ trễ.
- Kênh: build web có **Seed Link** để người chơi báo "seed này lỗi".

### 27.4 Ma trận thiết bị tối thiểu
| Nhóm | Thiết bị đại diện | Kiểm |
|---|---|---|
| Android thấp | RAM 3GB, ~Snapdragon 665 | 60FPS, nhiệt, bộ nhớ, rung |
| Android trung/cao | Chrome mới | 90/120Hz nội suy, PWA cài |
| iPhone cũ | iPhone 8/SE2 (iOS 15+) | Safari tab **và** PWA, âm thanh mở khoá, safe-area |
| iPhone mới | Dynamic Island | safe-area, overlay xoay ngang |
| iPad | Safari | tỉ lệ 4:3 (canvas clamp 360–480) |
| Desktop | Chrome/Edge/Firefox/Safari | KB+chuột, hot-swap input |

### 27.5 Cổng phát hành (tất cả phải ✔)
- [ ] 60FPS: p95 ≤ 16.7ms **5 phút** ở phòng nặng nhất (B5·L5, Heat 10, 24 địch, hiệu ứng đầy) trên máy chuẩn thấp.
- [ ] 0 crash trong **200 run bot** + 20 run tay; không softlock (cửa luôn mở được, boss luôn kết thúc được).
- [ ] **10.000 seed/biome** sinh hợp lệ; Daily 30 ngày liên tiếp hợp lệ.
- [ ] Save: hỏng file chính → tự khôi phục `.bak`; Xuất → Nhập khứ hồi nguyên vẹn; đầy bộ nhớ → báo lỗi, không mất dữ liệu cũ.
- [ ] **Offline:** bật chế độ máy bay sau lần tải đầu → chơi trọn run + lưu được.
- [ ] Vòng đời: khoá màn/chuyển app/kill tab giữa phòng → mở lại đúng đầu phòng, đồ & vàng đúng.
- [ ] Telegraph: `validate-content` xanh; **mọi** đòn khớp vùng sát thương ±2f (kiểm bằng hitbox viewer).
- [ ] Đủ chuỗi VI + EN, kiểm `ệ ữ ặ ẳ ỡ ợ`; EN dài +30% không vỡ layout.
- [ ] Mù màu/giảm nhấp nháy/cỡ chữ/tay trái hoạt động; không thao tác nào cần hover/chuột phải.
- [ ] CSP không vi phạm; 0 request ngoài; không `eval`; import save độc hại (prototype pollution, số cực lớn, chuỗi dài) bị chặn.
- [ ] `index.html` ≤ 1.5 MB; TTI ≤ 3s (4G).

---

## 28. Kế hoạch sản xuất (dev solo)
> **Ước tính ≈ 18 tuần (~4.5 tháng) ở ~25 giờ/tuần** cho v1.0 đầy đủ (bản cũ ước tính **22–26 tháng** cho nhóm 4–6 người, **30–36 tháng** nếu solo có thuê ngoài). Đây là ước tính thô — điều chỉnh sau M1.
| Mốc | Tuần | Mục tiêu | Xong khi |
|---|---|---|---|
| **M0 Nền** | 1 | Repo, build 1-file, PWA khung, canvas scaler, vòng lặp 60Hz, input cảm ứng, RNG/test | Nhân vật chạy mượt 60FPS trên điện thoại thật |
| **M1 Combat** | 2 | Ashblade + Kiếm Tro, dash, pipeline, 3 địch (Grunt/Archer/Rusher), telegraph, hitstop | **Fun gate (27.3) qua** |
| **M2 Run** | 2 | Đồ thị, sinh phòng, cửa, wave/threat, B1 đủ địch + Gorrak, HUD, autosave | Chơi trọn B1 tới boss |
| **M3 Đồ** | 2 | 60 relic (registry), reward/shop/rest/event/shrine, kinh tế, status+reaction, consumable | Build khác nhau cảm nhận rõ. **Phát Alpha công khai (GitHub Pages/itch)** |
| **M4 Class** | 2 | 3 class còn lại, 12 vũ khí, skill, Aspect, Mastery | 4 class chơi khác hẳn nhau |
| **M5 Biome** | 3 | B2–B5 (32 địch), hazard, 4 boss + Vua Tro | Chơi trọn 1 run từ đầu đến Vua Tro |
| **M6 Meta** | 2 | Hub, Cây Tàn Lửa, mở khóa, Heat, Mutator, Vực Sâu, Daily, Secret + Hư Không, kết thúc | Vòng meta hoàn chỉnh |
| **M7 Polish** | 2 | Audio sinh + nhạc, Sprite Forge hoàn thiện, i18n VI/EN, Cài đặt, accessibility, Seed Link, Share Card, FTUE | Cảm giác "đóng gói" |
| **M8 QA & Ra mắt** | 2 | Cổng 27.5, thiết bị thật, sim cân bằng, PWA, phát hành | Tick hết 27.5 |
**Rủi ro & giảm thiểu**
| Rủi ro | Giảm thiểu |
|---|---|
| Cảm giác chạm kém (ngón che màn, nút nhỏ) | Fun gate ở M1 trên máy thật; Scheme B; cỡ/độ trong nút; aim assist |
| Tụt FPS máy yếu | Cap cứng 24.3 + chất lượng tự động; đo từ M0 |
| iOS: âm thanh/lưu trữ/xoay màn | Mở khoá âm lần chạm đầu; Xuất save; overlay xoay; kiểm iPhone cũ từ M0 |
| Phình scope | MoSCoW (29.2) + **thứ tự cắt** + data-driven |
| Cân bằng 60 relic × 4 class | Bot headless + `balance.js` + playtest |
| Kiệt sức | **Phát hành theo lát cắt**: Alpha ở M3, Beta ở M6; mỗi mốc có thứ chơi được |

---

## 29. Lộ trình, MoSCoW, Ý tưởng mở rộng

### 29.1 Sau v1.0
| Bản | Nội dung |
|---|---|
| **v1.1** | Trapper & Bonecaller (spec lại từ v1.0 gốc) · 6 mini-boss · +20 relic · Boss Rush · Weekly · **Thách Đấu Bạn Bè** (§29.3 #2) · Replay `.ashrun` (Cùng-engine) |
| **v1.2** | Chế độ **dọc 1 tay** (§29.3 #4) · thêm ngôn ngữ (JSON) · Gương Ký Ức ở Hub · bảng xếp hạng online **(chỉ khi có server xác minh replay, `SEC-06`)** |
| **v1.3+** | Biome mới / "Mùa" (data-driven) · mod pack bằng JSON |

### 29.2 MoSCoW (launch v1.0)
| Mức | Hạng mục |
|---|---|
| 🟢 **Must** | Combat + telegraph + hitstop · cảm ứng (joystick nổi, nút, aim assist, buffer) · 4 class + 12 vũ khí · 5 biome + 5 boss + Vua Tro · 60 relic + Evolution + Resonance · status/reaction · Shop/Rest/Event/Shrine/Treasure · autosave + **Xuất/Nhập save** · PWA offline · Hub + Cây Tàn Lửa + Mastery · Heat · i18n VI/EN · accessibility cơ bản · cap hiệu năng · **Seed Link + Share Card** · FTUE |
| 🟡 **Should** | Secret + **Hư Không** + True Ending · Vực Sâu · Daily · Mutator · Scheme B (twin-stick) · Gamepad · Chất lượng tự động |
| ⚪ **Could** | Atlas PNG (Tier B) · Template ASCII vẽ tay · skin/danh hiệu thêm |
| ⛔ **Won't (1.0)** | Online/Co-op/PvP · MTX/ads · Replay · mini-boss · Trapper/Bonecaller · Boss Rush · Weekly |
**Thứ tự CẮT khi trễ tiến độ** (cắt từ trên xuống): ① Atlas Tier B → ② Gamepad + Scheme B → ③ Hư Không/True Ending/Secret → ④ Vực Sâu → ⑤ Mutator → ⑥ Daily → ⑦ Aspect 3 của mỗi class. **Không bao giờ cắt:** telegraph, autosave/xuất save, offline, accessibility cơ bản, hiệu năng.

### 29.3 Innovation Hub — ý tưởng nâng tầm (không chặn việc làm)
| # | Ý tưởng | Vì sao hợp web/mobile | Chi phí | Mức |
|---|---|---|---|---|
| 1 | **Seed Link + Share Card** | Chia sẻ build/seed qua Zalo/FB bằng 1 link, không cần server | Thấp | **Đã có trong v1.0** |
| 2 | **Thách Đấu Bạn Bè** — mã build (~300 ký tự, nén base64url) đặt vào link `#mirror=…`; người nhận đánh **Boss Gương** bằng build của bạn | Lan truyền không server; tái dùng Boss Hư Không | Thấp–Vừa | v1.1 |
| 3 | **Haptic Language** — rung **trước** đòn: vàng = *2 nhịp ngắn*, tím = *1 nhịp dài*; kết hợp màu/hình (không chỉ dựa rung) | Android: đọc đòn không cần nhìn; hỗ trợ truy cập | Thấp | v1.0 nếu còn thời gian |
| 4 | **Chế độ dọc 1 tay** — tự đánh mục tiêu gần nhất, chạm = Dash, kéo = di chuyển | Chơi khi đi xe buýt; mở rộng người chơi | Vừa | v1.2 |
| 5 | **Dòng thời gian run** trên Share Card — mini-graph các phòng đã đi + khoảnh khắc chết | Nội dung chia sẻ giàu thông tin | Thấp | v1.1 |

### 29.4 Quyết định còn mở (mặc định đã chọn; không chặn việc làm)
| Mục | Mặc định | Đổi khi |
|---|---|---|
| Nơi host | GitHub Pages / Cloudflare Pages / itch.io (HTML5) | Cần domain riêng |
| Ủng hộ | 1 link ngoài trong Cài đặt (Ko-fi/MoMo/…) | Muốn bỏ hoàn toàn |
| Nguồn art Tier B | Tự vẽ (Aseprite/Piskel) hoặc thuê | Có họa sĩ |
| Tên miền/Brand | `ashbound` | — |

### 29.5 Quy ước đặt tên & thuật ngữ
- **ID:** `snake_case`, tiền tố theo loại: `wpn_`, `evt_`, boss/đòn boss `g_ m_ v_ i_ s_ k_ + tên`, relic `rel_<mã>` (trong data chỉ ghi mã `c01`…). Enemy dùng tên rút gọn (`skel_grunt`).
- **Đơn vị:** `t` = tile (16px) · `f` = frame logic (1/60s) · tốc độ = **t/s** · `×` = nhân với `Raw` · `scale` = `DMG_MULT[biome]` hoặc `1+0.15B` tuỳ ngữ cảnh ghi rõ.
- **Thuật ngữ:** *Telegraph* = vùng cảnh báo trước đòn · *Raw* = sát thương gốc trước crit/giáp · *Snap* = Raw lưu lúc áp DoT · *Heat* = độ khó người chơi tự chọn · *Tàn Hồn* = tiền meta · *Aspect* = biến thể class · *Resonance* = thưởng khi đủ relic cùng tag · *Break* = nhịp đứng yên của boss khi đổi phase.

---
*Hết tài liệu. Mọi mục có `[ID]` đều kiểm được bằng test/validate/checklist ở §27. Khi một con số trong tài liệu mâu thuẫn con số trong `data/balance.js`, **dữ liệu thắng** — nhưng phải sửa lại tài liệu này cùng lúc.*
