package com.pokemon.marketplace.config;

import com.pokemon.marketplace.entity.*;
import com.pokemon.marketplace.entity.enums.UserRole;
import com.pokemon.marketplace.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final StoreLocationRepository storeLocationRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuctionRepository auctionRepository;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            log.info("Database is empty. Seeding Pokemon Card Store data...");

            
            User ash = User.builder()
                    .username("ash_ketchum")
                    .email("ash@kanto.com")
                    .password(passwordEncoder.encode("pika123"))
                    .phone("0909123456")
                    .shippingAddress("123 Pallet Town, Kanto Region")
                    .role(UserRole.USER)
                    .build();

            User gary = User.builder()
                    .username("gary_oak")
                    .email("gary@kanto.com")
                    .password(passwordEncoder.encode("eevee123"))
                    .phone("0909987654")
                    .shippingAddress("456 Viridian City, Kanto Region")
                    .role(UserRole.USER)
                    .build();

            User admin = User.builder()
                    .username("admin")
                    .email("admin@pokecardstore.com")
                    .password(passwordEncoder.encode("admin123"))
                    .phone("0911000222")
                    .shippingAddress("Pokemon Card Store HQ, TP.HCM")
                    .role(UserRole.ADMIN)
                    .build();

            User userTest = User.builder()
                    .username("user_test")
                    .email("user@test.com")
                    .password(passwordEncoder.encode("password123"))
                    .phone("0901234567")
                    .shippingAddress("Test User Address")
                    .role(UserRole.USER)
                    .build();

            User adminTest = User.builder()
                    .username("admin_test")
                    .email("admin@test.com")
                    .password(passwordEncoder.encode("password123"))
                    .phone("0907654321")
                    .shippingAddress("Test Admin Address")
                    .role(UserRole.ADMIN)
                    .build();

            User user = User.builder()
                    .username("user")
                    .email("user@pokecardstore.com")
                    .password(passwordEncoder.encode("password123"))
                    .phone("0900000000")
                    .shippingAddress("TP.HCM, Việt Nam")
                    .role(UserRole.USER)
                    .build();

            User newAdmin = User.builder()
                    .username("admin_new")
                    .email("admin_new@pokecardstore.com")
                    .password(passwordEncoder.encode("password123"))
                    .phone("0911999999")
                    .shippingAddress("TP.HCM, Việt Nam")
                    .role(UserRole.ADMIN)
                    .build();

            User customAdmin = User.builder()
                    .username("admin_custom")
                    .email("admin_custom@pokecardstore.com")
                    .password(passwordEncoder.encode("adminpassword"))
                    .phone("0909090909")
                    .shippingAddress("TP.HCM, Việt Nam")
                    .role(UserRole.ADMIN)
                    .build();

            userRepository.save(ash);
            userRepository.save(gary);
            userRepository.save(admin);
            userRepository.save(userTest);
            userRepository.save(adminTest);
            userRepository.save(user);
            userRepository.save(newAdmin);
            userRepository.save(customAdmin);
            log.info("Seeded users: ash_ketchum, gary_oak, admin, user_test, admin_test, user, admin_new, admin_custom");

            
            
            Object[][] cardData = {
                
                {"Charizard VMAX Rainbow Rare", "Charizard", "299.99", "249.99", 3,
                 "Thẻ bài siêu hiếm dạng Rainbow Rare với hiệu ứng ánh cầu vồng tuyệt đẹp. Đây là một trong những thẻ hiếm nhất thế giới.",
                 "Secret Rare", "Mint", "Fire", "330 HP", "074/073", "Sword & Shield - Champion's Path", "5ban Graphics",
                 "https://images.pokemontcg.io/swsh35/74.png"},

                {"Charizard VMAX", "Charizard", "149.99", "129.99", 5,
                 "Charizard phiên bản Max Dynamax với sức mạnh khổng lồ. G-Max Wildfire thiêu đốt mọi kẻ thù.",
                 "VMAX", "Near Mint", "Fire", "330 HP", "020/073", "Sword & Shield - Champion's Path", "5ban Graphics",
                 "https://images.pokemontcg.io/swsh35/20.png"},

                {"Charizard VSTAR", "Charizard", "89.99", "79.99", 8,
                 "Charizard VSTAR với khả năng Star Attack hủy diệt, một trong những thẻ mạnh nhất thế giới Pokemon TCG.",
                 "VSTAR", "Near Mint", "Fire", "280 HP", "018/172", "Brilliant Stars", "5ban Graphics",
                 "https://images.pokemontcg.io/swsh9/18.png"},

                {"Mewtwo VSTAR Alt Art", "Mewtwo", "199.99", null, 2,
                 "Mewtwo VSTAR với nghệ thuật thiết kế tuyệt đẹp mô tả trận chiến huyền thoại. Một tác phẩm nghệ thuật đỉnh cao của dòng Crown Zenith Galarian Gallery.",
                 "Secret Rare", "Mint", "Psychic", "280 HP", "GG44/GG70", "Crown Zenith - Galarian Gallery", "GOSSAN",
                 "https://images.pokemontcg.io/swsh12pt5gg/GG44.png"},

                {"Umbreon VMAX Alt Art", "Umbreon", "179.99", "159.99", 3,
                 "Umbreon VMAX Alternative Art với nền đêm tuyệt đẹp. Được cộng đồng yêu thích nhất trong bộ Evolving Skies.",
                 "Secret Rare", "Mint", "Darkness", "310 HP", "215/203", "Sword & Shield - Evolving Skies", "Ryota Murayama",
                 "https://images.pokemontcg.io/swsh7/215.png"},

                {"Rayquaza VMAX Alt Art", "Rayquaza", "159.99", "139.99", 4,
                 "Rayquaza VMAX Alternative Art bay qua tầng bình lưu với hiệu ứng màu sắc rực rỡ. Một trong những thẻ đẹp nhất Pokemon TCG.",
                 "Secret Rare", "Near Mint", "Dragon", "320 HP", "218/203", "Sword & Shield - Evolving Skies", "Anesaki Dynamic",
                 "https://images.pokemontcg.io/swsh7/218.png"},

                {"Pikachu VMAX", "Pikachu", "99.99", "89.99", 6,
                 "Pikachu phiên bản VMAX khổng lồ với sức mạnh sấm sét tối thượng Max Lightning.",
                 "VMAX", "Near Mint", "Lightning", "300 HP", "044/185", "Sword & Shield - Vivid Voltage", "5ban Graphics",
                 "https://images.pokemontcg.io/swsh4/44.png"},

                {"Gengar VMAX", "Gengar", "69.99", null, 10,
                 "Gengar VMAX với sức mạnh bóng tối và khả năng G-Max Terror chí mạng.",
                 "VMAX", "Near Mint", "Psychic", "310 HP", "157/264", "Sword & Shield - Fusion Strike", "5ban Graphics",
                 "https://images.pokemontcg.io/swsh8/157.png"},

                {"Giratina V Alt Art", "Giratina", "189.99", "179.99", 2,
                 "Giratina V Alternative Art cực kỳ huyền bí và hoành tráng, phản ánh chiều không gian hỗn loạn Distortion World.",
                 "Secret Rare", "Mint", "Dragon", "220 HP", "186/196", "Sword & Shield - Lost Origin", "Shinji Kanda",
                 "https://images.pokemontcg.io/swsh11/186.png"},

                
                {"Charizard ex SAR - 151", "Charizard", "129.99", "109.99", 4,
                 "Charizard ex Special Art Rare từ bộ Scarlet & Violet 151, hoạ tiết nghệ thuật nổi bật với ngọn lửa rực rỡ.",
                 "Special Art Rare", "Mint", "Fire", "330 HP", "199/165", "Scarlet & Violet - 151", "Teeziro",
                 "https://images.pokemontcg.io/sv3pt5/199.png"},

                {"Charizard ex SAR - Obsidian", "Charizard", "119.99", null, 3,
                 "Charizard ex Special Art Rare với tạo hình Terastal rực rỡ từ bộ Obsidian Flames. Một tác phẩm bóng đêm đầy quyền lực.",
                 "Special Art Rare", "Mint", "Fire", "330 HP", "223/197", "Scarlet & Violet - Obsidian Flames", "AKIRA EGAWA",
                 "https://images.pokemontcg.io/sv3/223.png"},

                {"Mew ex SAR - 151", "Mew", "79.99", "69.99", 5,
                 "Mew ex Special Art Rare với hình vẽ nghệ thuật đáng yêu của Mew đang trôi bồng bềnh giữa bầu trời.",
                 "Special Art Rare", "Near Mint", "Psychic", "180 HP", "205/165", "Scarlet & Violet - 151", "Natsumi Yoshida",
                 "https://images.pokemontcg.io/sv3pt5/205.png"},

                {"Pikachu ex SAR", "Pikachu", "59.99", "49.99", 8,
                 "Pikachu ex Special Art Rare dễ thương nhất Pokemon 151, hình ảnh Pikachu vui tươi đầy màu sắc.",
                 "Special Art Rare", "Near Mint", "Lightning", "130 HP", "173/165", "Scarlet & Violet - 151", "Mitsuhiro Arita",
                 "https://images.pokemontcg.io/sv3pt5/173.png"},

                {"Gengar ex SAR", "Gengar", "89.99", "79.99", 3,
                 "Gengar ex Special Art Rare từ Temporal Forces mang phong cách kì bí, nghịch ngợm đặc trưng.",
                 "Special Art Rare", "Mint", "Psychic", "310 HP", "193/162", "Scarlet & Violet - Temporal Forces", "Akira Komayama",
                 "https://images.pokemontcg.io/sv5/193.png"},

                {"Roaring Moon ex SAR", "Roaring Moon", "94.99", null, 4,
                 "Roaring Moon ex Special Art Rare từ Paradox Rift, Pokemon cổ đại mang sức mạnh hủy diệt nguyên thủy.",
                 "Special Art Rare", "Mint", "Darkness", "230 HP", "251/182", "Scarlet & Violet - Paradox Rift", "Atsushi Furusawa",
                 "https://images.pokemontcg.io/sv4/251.png"},

                {"Lugia V Alt Art", "Lugia", "59.99", null, 7,
                 "Lugia V Alternative Art bay qua đại dương với cánh trắng tinh khôi. Một trong những thẻ V đẹp nhất.",
                 "Ultra Rare", "Near Mint", "Colorless", "220 HP", "186/195", "Silver Tempest", "Hosokawa Atsushi",
                 "https://images.pokemontcg.io/swsh12/186.png"},

                {"Espeon VMAX Alt Art", "Espeon", "79.99", "69.99", 5,
                 "Espeon VMAX Alternative Art với ánh hào quang tâm linh huyền bí trong ánh chiều tà.",
                 "Secret Rare", "Mint", "Psychic", "300 HP", "209/203", "Sword & Shield - Evolving Skies", "Ryota Murayama",
                 "https://images.pokemontcg.io/swsh7/209.png"},

                {"Greninja ex SAR", "Greninja", "139.99", "129.99", 3,
                 "Greninja ex Special Art Rare mang phong cách hội họa Nhật Bản cổ điển đầy nghệ thuật và ấn tượng.",
                 "Special Art Rare", "Mint", "Water", "310 HP", "214/167", "Scarlet & Violet - Twilight Masquerade", "Masako Yamashita",
                 "https://images.pokemontcg.io/sv6/214.png"},

                {"Latias & Latios GX Alt Art", "Latias & Latios", "399.99", "349.99", 1,
                 "Thẻ bài đôi Latias & Latios tạo hình trái tim huyền thoại, một trong những thẻ GX đắt đỏ và lãng mạn nhất.",
                 "Secret Rare", "Mint", "Dragon", "270 HP", "170/181", "Sun & Moon - Team Up", "Adabana",
                 "https://images.pokemontcg.io/sm9/170.png"},

                
                {"Charizard Holo - Base Set", "Charizard", "349.99", null, 2,
                 "Thẻ huyền thoại từ Base Set 1999. Charizard Holo gốc là một trong những thẻ bài có giá trị nhất mọi thời đại.",
                 "Holo Rare", "Lightly Played", "Fire", "120 HP", "4/102", "Base Set (1999)", "Mitsuhiro Arita",
                 "https://images.pokemontcg.io/base1/4.png"},

                {"Blastoise Holo - Base Set", "Blastoise", "89.99", "79.99", 4,
                 "Blastoise Holo từ Base Set gốc 1999. Thẻ khai mạc Pokemon TCG với giá trị sưu tầm rất cao.",
                 "Holo Rare", "Lightly Played", "Water", "100 HP", "2/102", "Base Set (1999)", "Ken Sugimori",
                 "https://images.pokemontcg.io/base1/2.png"},

                {"Venusaur Holo - Base Set", "Venusaur", "69.99", null, 5,
                 "Venusaur Holo Base Set hoàn chỉnh bộ Starter Pokemon huyền thoại cùng Charizard và Blastoise.",
                 "Holo Rare", "Good", "Grass", "100 HP", "15/102", "Base Set (1999)", "Mitsuhiro Arita",
                 "https://images.pokemontcg.io/base1/15.png"},

                {"Pikachu Gold Star", "Pikachu", "199.99", "179.99", 3,
                 "Pikachu Gold Star - một trong những thẻ hiếm nhất kỷ nguyên Gold Star. Ngôi sao vàng biểu tượng Pokemon.",
                 "Gold Star", "Near Mint", "Lightning", "60 HP", "104/110", "EX Holon Phantoms", "Masakazu Fukuda",
                 "https://images.pokemontcg.io/ex13/104.png"},

                {"Umbreon Gold Star", "Umbreon", "299.99", null, 2,
                 "Umbreon Gold Star cực kỳ hiếm từ POP Series 5. Đây là một trong những thẻ Gold Star đắt nhất mọi thời đại.",
                 "Gold Star", "Near Mint", "Darkness", "80 HP", "17/17", "POP Series 5", "Masakazu Fukuda",
                 "https://images.pokemontcg.io/pop5/17.png"},

                {"Espeon Gold Star", "Espeon", "279.99", "249.99", 2,
                 "Espeon Gold Star siêu hiếm từ POP Series 5. Bộ đôi Eevee-lution Gold Star là thánh vật của giới sưu tầm.",
                 "Gold Star", "Near Mint", "Psychic", "80 HP", "16/17", "POP Series 5", "Masakazu Fukuda",
                 "https://images.pokemontcg.io/pop5/16.png"},

                {"Rayquaza Gold Star", "Rayquaza", "249.99", null, 3,
                 "Rayquaza Gold Star từ EX Deoxys, rồng huyền thoại trên bầu trời với ngôi sao vàng rực rỡ.",
                 "Gold Star", "Near Mint", "Dragon", "100 HP", "107/107", "EX Deoxys", "Masakazu Fukuda",
                 "https://images.pokemontcg.io/ex9/107.png"},

                {"Arceus VSTAR Gold GG70", "Arceus", "109.99", "99.99", 3,
                 "Arceus VSTAR dạng Gold Rare từ Crown Zenith, vị thần sáng thế trong bức tranh thiên đường rực rỡ.",
                 "Secret Rare", "Mint", "Colorless", "280 HP", "GG70/GG70", "Crown Zenith - Galarian Gallery", "Akira Egawa",
                 "https://images.pokemontcg.io/swsh12pt5gg/GG70.png"},

                {"Giratina VSTAR Gold GG69", "Giratina", "129.99", null, 2,
                 "Giratina VSTAR dạng Gold Rare từ Crown Zenith, bóng ma Distortion World oai hùng trong sắc vàng rực rỡ.",
                 "Secret Rare", "Mint", "Dragon", "280 HP", "GG69/GG70", "Crown Zenith - Galarian Gallery", "Akira Egawa",
                 "https://images.pokemontcg.io/swsh12pt5gg/GG69.png"},

                {"Dialga VSTAR Gold GG68", "Dialga", "109.99", "99.99", 3,
                 "Origin Forme Dialga VSTAR Gold Rare từ Crown Zenith, chúa tể thời gian lộng lẫy.",
                 "Secret Rare", "Mint", "Metal", "280 HP", "GG68/GG70", "Crown Zenith - Galarian Gallery", "Akira Egawa",
                 "https://images.pokemontcg.io/swsh12pt5gg/GG68.png"},

                {"Palkia VSTAR Gold GG67", "Palkia", "109.99", "99.99", 3,
                 "Origin Forme Palkia VSTAR Gold Rare từ Crown Zenith, chúa tể không gian hùng vĩ.",
                 "Secret Rare", "Mint", "Water", "280 HP", "GG67/GG70", "Crown Zenith - Galarian Gallery", "Akira Egawa",
                 "https://images.pokemontcg.io/swsh12pt5gg/GG67.png"},

                
                {"Pikachu VMAX Rainbow Rare", "Pikachu", "189.99", "169.99", 2,
                 "Pikachu VMAX dạng Rainbow Rare (Fat Pikachu) cực kỳ đáng yêu và siêu hiếm trong bộ Vivid Voltage.",
                 "Secret Rare", "Mint", "Lightning", "300 HP", "188/185", "Sword & Shield - Vivid Voltage", "5ban Graphics",
                 "https://images.pokemontcg.io/swsh4/188.png"},

                {"Lugia Shadowless Holo", "Lugia", "149.99", "129.99", 4,
                 "Lugia Neo Genesis Holo với in ấn không bóng (shadowless) từ thời kỳ Neo đầu những năm 2000.",
                 "Holo Rare", "Near Mint", "Colorless", "90 HP", "9/111", "Neo Genesis (2000)", "Ryo Ueda",
                 "https://images.pokemontcg.io/neo1/9.png"},

                {"Ho-Oh Holo", "Ho-Oh", "59.99", "49.99", 6,
                 "Ho-Oh Holo Neo Revelation bay trên bầu trời rực rỡ với bộ lông 7 màu huyền thoại.",
                 "Holo Rare", "Near Mint", "Fire", "90 HP", "7/64", "Neo Revelation", "Ryo Ueda",
                 "https://images.pokemontcg.io/neo3/7.png"},

                {"Typhlosion Holo", "Typhlosion", "24.99", null, 12,
                 "Typhlosion Holo từ Neo Genesis với ngọn lửa Blast Burn mạnh mẽ.",
                 "Holo Rare", "Near Mint", "Fire", "100 HP", "17/111", "Neo Genesis", "Shin-ichi Yoshida",
                 "https://images.pokemontcg.io/neo1/17.png"},

                {"Gyarados Holo - Base Set", "Gyarados", "29.99", "24.99", 10,
                 "Gyarados Holo từ Base Set 1999 với thiết kế rồng biển hùng tráng.",
                 "Holo Rare", "Good", "Water", "100 HP", "6/102", "Base Set (1999)", "Mitsuhiro Arita",
                 "https://images.pokemontcg.io/base1/6.png"},

                {"Zapdos Holo - Base Set", "Zapdos", "34.99", null, 8,
                 "Zapdos Holo từ Base Set, chim sét huyền thoại Kanto với sức công phá điện cực mạnh.",
                 "Holo Rare", "Lightly Played", "Lightning", "90 HP", "16/102", "Base Set (1999)", "Ken Sugimori",
                 "https://images.pokemontcg.io/base1/16.png"},

                {"Moltres Holo - Fossil", "Moltres", "24.99", "19.99", 10,
                 "Moltres Holo từ Fossil set, chim lửa huyền thoại Kanto với ngọn lửa bất diệt.",
                 "Holo Rare", "Good", "Fire", "70 HP", "12/62", "Fossil (1999)", "Ken Sugimori",
                 "https://images.pokemontcg.io/base3/12.png"},

                {"Articuno Holo - Fossil", "Articuno", "24.99", null, 9,
                 "Articuno Holo từ Fossil set hoàn chỉnh bộ ba chim huyền thoại Kanto với băng tuyết lạnh buốt.",
                 "Holo Rare", "Near Mint", "Water", "70 HP", "2/62", "Fossil (1999)", "Ken Sugimori",
                 "https://images.pokemontcg.io/base3/2.png"},

                {"Pikachu No. 25 Promo", "Pikachu", "12.99", null, 20,
                 "Pikachu huyền thoại số 25 Promo, được phát hành vào kỷ niệm 25 năm Pokemon.",
                 "Promo", "Mint", "Lightning", "60 HP", "SWSH061", "Pokemon 25th Anniversary Promo", "Atsuko Nishida",
                 "https://images.pokemontcg.io/swshp/SWSH061.png"},

                {"Eevee Holo Rare", "Eevee", "9.99", "7.99", 15,
                 "Eevee Holo Rare đáng yêu từ Sword & Shield, thú cưng yêu thích của hàng triệu trainer.",
                 "Holo Rare", "Mint", "Colorless", "70 HP", "155/202", "Sword & Shield", "Shibuzoh.",
                 "https://images.pokemontcg.io/swsh1/155.png"},

                {"Snorlax V", "Snorlax", "14.99", null, 18,
                 "Snorlax V với khả năng phòng thủ khổng lồ và nằm ngủ cản đường đối thủ.",
                 "Ultra Rare", "Near Mint", "Colorless", "220 HP", "141/202", "Sword & Shield", "5ban Graphics",
                 "https://images.pokemontcg.io/swsh1/141.png"},

                {"Lucario VSTAR", "Lucario", "34.99", "29.99", 10,
                 "Lucario VSTAR với khả năng Star Aura khoan xuyên tấm chắn của đối thủ.",
                 "VSTAR", "Near Mint", "Fighting", "270 HP", "112/189", "Sword & Shield - Astral Radiance", "5ban Graphics",
                 "https://images.pokemontcg.io/swsh10/112.png"},

                {"Gardevoir ex", "Gardevoir", "29.99", null, 12,
                 "Gardevoir ex Scarlet & Violet với khả năng Psychic Embrace nạp năng lượng cực nhanh.",
                 "Double Rare", "Near Mint", "Psychic", "310 HP", "086/198", "Scarlet & Violet - Paldea Evolved", "5ban Graphics",
                 "https://images.pokemontcg.io/sv1/86.png"},

                {"Iono Full Art", "Iono", "49.99", "44.99", 6,
                 "Iono Full Art Trainer Card cực hot với thiết kế nhân vật Gym Leader Paldea sặc sỡ.",
                 "Full Art", "Mint", "Trainer", "N/A", "269/193", "Scarlet & Violet - Paldea Evolved", "Yuu Nishimura",
                 "https://images.pokemontcg.io/sv2/269.png"},

                {"Pikachu Common - Base Set", "Pikachu", "4.99", null, 50,
                 "Pikachu gốc từ Base Set 1999 dạng Common. Huyền thoại từ thuở đầu Pokemon TCG.",
                 "Common", "Lightly Played", "Lightning", "40 HP", "58/102", "Base Set (1999)", "Atsuko Nishida",
                 "https://images.pokemontcg.io/base1/58.png"},

                {"Bulbasaur Common", "Bulbasaur", "3.99", "2.99", 40,
                 "Bulbasaur Common dễ thương từ Base Set, Starter Pokemon số 001 của Kanto.",
                 "Common", "Near Mint", "Grass", "40 HP", "44/102", "Base Set (1999)", "Mitsuhiro Arita",
                 "https://images.pokemontcg.io/base1/44.png"},

                {"Squirtle Common", "Squirtle", "3.99", null, 45,
                 "Squirtle Common từ Base Set, Starter Pokemon nước yêu thích của nhiều trainer.",
                 "Common", "Near Mint", "Water", "40 HP", "63/102", "Base Set (1999)", "Ken Sugimori",
                 "https://images.pokemontcg.io/base1/63.png"},

                
                {"Scarlet & Violet 151 Elite Trainer Box", "ETB", "59.99", "49.99", 10,
                 "Hộp Elite Trainer Box Scarlet & Violet 151 cao cấp, chứa 9 gói booster pack và phụ kiện xúc xắc, token, bọc bài.",
                 "Sealed", "New", "Sealed", "N/A", "ETB-151", "Scarlet & Violet - 151", "The Pokémon Company",
                 "/images/booster_box_151.png"},

                
                {"Gấu bông Pikachu (20cm) Đáng Yêu", "Pikachu", "24.99", "19.99", 15,
                 "Gấu bông Pikachu phiên bản giới hạn mềm mại, kích thước 20cm, hàng chính hãng Pokemon Center.",
                 "Plush", "New", "Plush", "N/A", "PL-Pika", "Pokemon Center", "The Pokémon Company",
                 "/images/plush_pikachu.png"},

                {"Gấu bông Snorlax Ngủ Ngon (30cm)", "Snorlax", "39.99", null, 5,
                 "Gấu bông Snorlax siêu to khổng lồ, mềm mại thích hợp ôm ngủ, kích thước 30cm chính hãng.",
                 "Plush", "New", "Plush", "N/A", "PL-Snor", "Pokemon Center", "The Pokémon Company",
                 "/images/plush_snorlax.png"},

                
                {"Mô hình Charizard Action Figure", "Charizard", "49.99", "44.99", 8,
                 "Mô hình Charizard với ngọn lửa đuôi rực cháy, sải cánh rộng và khớp động linh hoạt. Hàng sưu tầm cao cấp.",
                 "Figure", "New", "Figure", "N/A", "FG-Char", "Takara Tomy", "Takara Tomy",
                 "/images/figure_charizard.png"},

                {"Mô hình Mewtwo Ultimate Figure", "Mewtwo", "54.99", null, 6,
                 "Mô hình Mewtwo tư thế chiến đấu hoành tráng kèm hiệu ứng hào quang tâm linh trong suốt.",
                 "Figure", "New", "Figure", "N/A", "FG-Mew", "Takara Tomy", "Takara Tomy",
                 "/images/figure_mewtwo.png"},

                
                {"Hộp đựng bài PokeBall Deck Box", "PokeBall", "14.99", "11.99", 25,
                 "Hộp đựng bài TCG giả da cao cấp in hình PokeBall, nắp hít nam châm chắc chắn chứa được 100+ lá bài.",
                 "Accessory", "New", "Accessory", "N/A", "AC-Ball", "Ultra Pro", "Ultra Pro",
                 "/images/deck_box_pokeball.png"},

                {"Bao bảo vệ bài Rayquaza Sleeves", "Rayquaza", "9.99", null, 40,
                 "Bộ 65 bọc bài (sleeves) nhám mờ cao cấp, in hình Rayquaza bay lượn trên bầu trời, bảo vệ thẻ bài tối ưu.",
                 "Accessory", "New", "Accessory", "N/A", "AC-Ray", "Ultra Pro", "Ultra Pro",
                 "/images/sleeves_rayquaza.png"},

                {"Mô hình Pokemon Circular Diorama Collection 2 - A Sparkling Moment (Blind Box) - Re-ment", "Pokemon", "9.80", null, 8,
                 "Mô hình diorama xoay tròn Pokemon cực kỳ dễ thương và tinh xảo từ hãng Re-ment Nhật Bản. Hộp mù ngẫu nhiên chứa 1 trong 6 mẫu diorama tuyệt đẹp.",
                 "Figure", "New", "Figure", "N/A", "FG-CIRC-02", "Re-ment Japan", "Nintendo Japan",
                 "/images/pokemon_diorama.png"},

                {"Mô hình Pokemon Terrarium Collection 12 (Blind Box) - Re-ment", "Pikachu", "9.80", null, 10,
                 "Mô hình Terrarium Pokemon phiên bản 12 chứa trong quả cầu PokeBall trong suốt. Các mẫu tiểu cảnh Pikachu, Eevee, Piplup xinh xắn.",
                 "Figure", "New", "Figure", "N/A", "FG-TERR-12", "Re-ment Japan", "Nintendo Japan",
                 "/images/pokemon_terrarium.png"},

                {"Game Pokemon Scarlet - Nintendo Switch", "Koraidon", "59.99", "49.99", 5,
                 "Game Pokemon thế hệ thứ 9 đình đám trên hệ máy Nintendo Switch. Khám phá vùng đất Paldea rộng lớn cùng Koraidon.",
                 "Game", "New", "Game", "N/A", "GM-SCARLET", "Nintendo", "Game Freak",
                 "/images/pokemon_scarlet_game.png"},

                {"Game Pokemon Legends: Z-A - Nintendo Switch", "Zygarde", "59.99", null, 7,
                 "Khám phá thành phố Lumiose và trải nghiệm cuộc phiêu lưu Pokemon hoàn toàn mới trong Pokemon Legends: Z-A sắp ra mắt.",
                 "Game", "New", "Game", "N/A", "GM-LEGENDS-ZA", "Nintendo", "Game Freak",
                 "/images/pokemon_legends_za_game.png"}
            };

            for (Object[] data : cardData) {
                Product product = Product.builder()
                        .name((String) data[0])
                        .brand((String) data[1])
                        .price(new BigDecimal((String) data[2]))
                        .promoPrice(data[3] != null ? new BigDecimal((String) data[3]) : null)
                        .stock((Integer) data[4])
                        .description((String) data[5])
                        .ram((String) data[6])    
                        .rom((String) data[7])    
                        .cpu((String) data[8])    
                        .camera((String) data[9]) 
                        .battery((String) data[10]) 
                        .screen((String) data[11])  
                        .os((String) data[12])       
                        .isAvailable(true)
                        .imageUrl((String) data[13])
                        .build();
                productRepository.save(product);
            }
            log.info("Seeded {} Pokemon cards successfully.", cardData.length);

            
            StoreLocation loc1 = StoreLocation.builder()
                    .name("PokeCard Store - Quận 7")
                    .address("123 Nguyễn Văn Linh, Tân Phong, Quận 7, TP.HCM")
                    .phone("0909 123 456")
                    .workingHours("9:00 - 21:00")
                    .latitude(10.7294)
                    .longitude(106.6958)
                    .build();

            StoreLocation loc2 = StoreLocation.builder()
                    .name("PokeCard Store - Quận 1")
                    .address("45 Bùi Thị Xuân, Bến Thành, Quận 1, TP.HCM")
                    .phone("0909 654 321")
                    .workingHours("9:00 - 22:00")
                    .latitude(10.7735)
                    .longitude(106.7001)
                    .build();

            StoreLocation loc3 = StoreLocation.builder()
                    .name("PokeCard Store - Bình Thạnh")
                    .address("205 Điện Biên Phủ, Phường 15, Bình Thạnh, TP.HCM")
                    .phone("0909 789 012")
                    .workingHours("9:00 - 21:30")
                    .latitude(10.8016)
                    .longitude(106.7088)
                    .build();

            storeLocationRepository.save(loc1);
            storeLocationRepository.save(loc2);
            storeLocationRepository.save(loc3);
            log.info("Seeded 3 Pokemon card store locations.");

            
            Notification notif1 = Notification.builder()
                    .title("Chào mừng đến với PokeCard Store! 🎴")
                    .content("Chào mừng Trainer mới! Khám phá hơn 35 thẻ bài Pokemon độc đáo bao gồm VMAX, VSTAR, Gold Star và thẻ gốc từ Base Set 1999. Chúc bạn sưu tầm vui vẻ!")
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();

            Notification notif2 = Notification.builder()
                    .title("🔥 Tuần Lễ Thẻ Hiếm - Giảm Giá Hot!")
                    .content("Giảm giá đặc biệt lên đến 20% cho các thẻ VMAX và Secret Rare! Charizard VMAX, Umbreon VMAX Alt Art và nhiều thẻ khác đang được trợ giá. Số lượng có hạn!")
                    .isRead(false)
                    .createdAt(LocalDateTime.now().minusDays(1))
                    .build();

            Notification notif3 = Notification.builder()
                    .title("📦 Về Hàng: Pokemon 151 Scarlet & Violet")
                    .content("Bộ thẻ Pokemon 151 đã về hàng! Charizard ex SAR, Mewtwo ex SAR và Pikachu ex SAR đang có trong kho. Đặt ngay trước khi hết!")
                    .isRead(false)
                    .createdAt(LocalDateTime.now().minusDays(2))
                    .build();

            notificationRepository.save(notif1);
            notificationRepository.save(notif2);
            notificationRepository.save(notif3);
            log.info("Seeded 3 Pokemon card store notifications.");
        } else {
            log.info("Database already contains data. Skipping seeding.");
        }

        if (auctionRepository.count() == 0) {
            log.info("Seeding default live auctions...");
            LocalDateTime now = LocalDateTime.now();
            java.util.List<Auction> defaults = new java.util.ArrayList<>();

            defaults.add(Auction.builder()
                    .cardName("Charizard VMAX Rainbow Rare")
                    .imageUrl("https://images.pokemontcg.io/swsh35/74.png")
                    .rarity("Secret Rare")
                    .condition("Mint")
                    .currentBid(new BigDecimal("260.00"))
                    .highestBidder("-")
                    .bidsCount(0)
                    .endTime(now.plusMinutes(3))
                    .status("active")
                    .createdByAdmin(false)
                    .bidHistory(new java.util.ArrayList<>())
                    .build());

            defaults.add(Auction.builder()
                    .cardName("Mewtwo VSTAR Alt Art")
                    .imageUrl("https://images.pokemontcg.io/swsh12pt5gg/GG44.png")
                    .rarity("Secret Rare")
                    .condition("Mint")
                    .currentBid(new BigDecimal("145.00"))
                    .highestBidder("-")
                    .bidsCount(0)
                    .endTime(now.plusMinutes(5))
                    .status("active")
                    .createdByAdmin(false)
                    .bidHistory(new java.util.ArrayList<>())
                    .build());

            defaults.add(Auction.builder()
                    .cardName("Umbreon VMAX Alt Art")
                    .imageUrl("https://images.pokemontcg.io/swsh7/215.png")
                    .rarity("Secret Rare")
                    .condition("Mint")
                    .currentBid(new BigDecimal("165.00"))
                    .highestBidder("-")
                    .bidsCount(0)
                    .endTime(now.plusMinutes(7))
                    .status("active")
                    .createdByAdmin(false)
                    .bidHistory(new java.util.ArrayList<>())
                    .build());

            defaults.add(Auction.builder()
                    .cardName("Rayquaza VMAX Alt Art")
                    .imageUrl("https://images.pokemontcg.io/swsh7/218.png")
                    .rarity("Secret Rare")
                    .condition("Near Mint")
                    .currentBid(new BigDecimal("130.00"))
                    .highestBidder("-")
                    .bidsCount(0)
                    .endTime(now.plusMinutes(10))
                    .status("active")
                    .createdByAdmin(false)
                    .bidHistory(new java.util.ArrayList<>())
                    .build());

            auctionRepository.saveAll(defaults);
            log.info("Seeded 4 default live auctions.");
        }
    }
}
