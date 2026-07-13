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
        // Automatically update existing admin user's email if present
        userRepository.findByUsername("admin").ifPresent(user -> {
            user.setEmail("pokemoncardstore4@gmail.com");
            user.setPassword(passwordEncoder.encode("admin123"));
            userRepository.save(user);
            log.info("Updated existing admin email to pokemoncardstore4@gmail.com and reset password to admin123");
        });

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
                    .email("pokemoncardstore4@gmail.com")
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
        }

        // Seed a pre-funded demo account (created once, balance not overwritten on restart)
        if (userRepository.findByUsername("rich_user").isEmpty()) {
            User richUser = User.builder()
                    .username("rich_user")
                    .email("rich@pokecardstore.com")
                    .password(passwordEncoder.encode("rich123"))
                    .phone("0900001111")
                    .shippingAddress("TP.HCM, Việt Nam")
                    .role(UserRole.USER)
                    .balance(100000.0)
                    .build();
            userRepository.save(richUser);
            log.info("Seeded demo account rich_user (password: rich123) with balance 100000");
        }

        // Seed products
        Object[][] cardData = {
            // --- ORIGINAL SEEDED PRODUCTS ---
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
             "/images/pokemon_legends_za_game.png"},

            // --- 50 NEW SEEDED PRODUCTS ---
            {"Mewtwo ex SAR - Paradox Rift", "Mewtwo", "75.00", "65.00", 5,
             "Thẻ Mewtwo ex Special Art Rare tuyệt đẹp trong bộ Paradox Rift với tạo hình phản chiếu huyền ảo.",
             "Special Art Rare", "Mint", "Psychic", "230 HP", "228/182", "Scarlet & Violet - Paradox Rift", "AKIRA EGAWA",
             "https://images.pokemontcg.io/sv4/228.png"},

            {"Roaring Moon ex - Paradox Rift", "Roaring Moon", "15.00", null, 12,
             "Thẻ bài rồng cổ đại Roaring Moon ex phiên bản gốc với sức mạnh bóng tối hủy diệt.",
             "Double Rare", "Near Mint", "Darkness", "230 HP", "124/182", "Scarlet & Violet - Paradox Rift", "5ban Graphics",
             "https://images.pokemontcg.io/sv4/124.png"},

            {"Iron Valiant ex SAR - Paradox Rift", "Iron Valiant", "85.00", null, 4,
             "Chiến binh tương lai Iron Valiant ex phiên bản nghệ thuật đặc biệt SAR đầy phong cách viễn tưởng.",
             "Special Art Rare", "Mint", "Psychic", "220 HP", "249/182", "Scarlet & Violet - Paradox Rift", "Kantaro",
             "https://images.pokemontcg.io/sv4/249.png"},

            {"Gholdengo ex SAR - Paradox Rift", "Gholdengo", "60.00", "50.00", 6,
             "Thẻ bài Gholdengo ex làm từ vàng nguyên khối lấp lánh cực kỳ độc đáo và giá trị cao.",
             "Special Art Rare", "Mint", "Metal", "260 HP", "252/182", "Scarlet & Violet - Paradox Rift", "Ryota Murayama",
             "https://images.pokemontcg.io/sv4/252.png"},

            {"Tera Charizard ex - Paldean Fates", "Charizard", "180.00", "159.99", 3,
             "Charizard ex Terastal dạng Shiny màu đen huyền thoại từ bộ Paldean Fates. Bức tranh nghệ thuật tuyệt vời.",
             "Shiny Special Art Rare", "Mint", "Darkness", "330 HP", "234/091", "Scarlet & Violet - Paldean Fates", "AKIRA EGAWA",
             "https://images.pokemontcg.io/sv45/234.png"},

            {"Gardevoir ex SAR - Paldean Fates", "Gardevoir", "90.00", null, 5,
             "Gardevoir ex dạng Shiny trong khung cảnh khu vườn mộng mơ đầy màu sắc huyền bí.",
             "Shiny Special Art Rare", "Mint", "Psychic", "310 HP", "233/091", "Scarlet & Violet - Paldean Fates", "Kuroimori",
             "https://images.pokemontcg.io/sv45/233.png"},

            {"Mew ex SAR - Paldean Fates", "Mew", "110.00", null, 4,
             "Mew ex phiên bản Shiny màu xanh ngọc bay lượn ngộ nghĩnh giữa bầu trời lấp lánh.",
             "Shiny Special Art Rare", "Mint", "Psychic", "180 HP", "232/091", "Scarlet & Violet - Paldean Fates", "USUMASHI",
             "https://images.pokemontcg.io/sv45/232.png"},

            {"Shiny Pikachu - Paldean Fates", "Pikachu", "35.00", null, 15,
             "Chú chuột điện Pikachu phiên bản Shiny lấp lánh cực kỳ dễ thương từ bộ Paldean Fates.",
             "Shiny Rare", "Near Mint", "Lightning", "90 HP", "131/091", "Scarlet & Violet - Paldean Fates", "OKACHEKE",
             "https://images.pokemontcg.io/sv45/131.png"},

            {"Teal Mask Ogerpon ex SAR - Twilight Masquerade", "Ogerpon", "80.00", null, 7,
             "Ogerpon ex mặt nạ Teal đầy nghệ thuật tái hiện truyền thuyết tại Kitakami.",
             "Special Art Rare", "Mint", "Grass", "210 HP", "211/167", "Scarlet & Violet - Twilight Masquerade", "Yano Keiji",
             "https://images.pokemontcg.io/sv6/211.png"},

            {"Hearthflame Mask Ogerpon ex SAR - Twilight Masquerade", "Hearthflame", "65.00", "55.00", 6,
             "Ogerpon ex mặt nạ Hearthflame rực lửa cực kỳ dũng mãnh và cuốn hút.",
             "Special Art Rare", "Mint", "Fire", "210 HP", "212/167", "Scarlet & Violet - Twilight Masquerade", "Teeziro",
             "https://images.pokemontcg.io/sv6/212.png"},

            {"Wellspring Mask Ogerpon ex SAR - Twilight Masquerade", "Ogerpon", "70.00", null, 5,
             "Ogerpon ex mặt nạ Wellspring mềm mại cuộn trào dòng nước xanh mướt.",
             "Special Art Rare", "Mint", "Water", "210 HP", "213/167", "Scarlet & Violet - Twilight Masquerade", "Oswaldo KATO",
             "https://images.pokemontcg.io/sv6/213.png"},

            {"Cornerstone Mask Ogerpon ex SAR - Twilight Masquerade", "Ogerpon", "50.00", null, 8,
             "Ogerpon ex mặt nạ Cornerstone cứng cáp như đá tảng sừng sững uy nghiêm.",
             "Special Art Rare", "Mint", "Fighting", "210 HP", "215/167", "Scarlet & Violet - Twilight Masquerade", "GIDORA",
             "https://images.pokemontcg.io/sv6/215.png"},

            {"Bloodmoon Ursaluna ex SAR - Twilight Masquerade", "Ursaluna", "115.00", "99.99", 3,
             "Gấu trăng máu Ursaluna ex siêu ngầu dưới ánh trăng đỏ rực rỡ kì bí.",
             "Special Art Rare", "Mint", "Colorless", "260 HP", "216/167", "Scarlet & Violet - Twilight Masquerade", "Shinji Kanda",
             "https://images.pokemontcg.io/sv6/216.png"},

            {"Carmine Full Art - Twilight Masquerade", "Carmine", "140.00", null, 2,
             "Thẻ bài nhân vật Carmine cực kỳ xinh đẹp và quyến rũ được săn đón hàng đầu bộ Twilight Masquerade.",
             "Special Art Rare", "Mint", "Trainer", "N/A", "217/167", "Scarlet & Violet - Twilight Masquerade", "Enoki",
             "https://images.pokemontcg.io/sv6/217.png"},

            {"Kieran Full Art - Twilight Masquerade", "Kieran", "75.00", null, 4,
             "Thẻ bài nhân vật Kieran đầy cá tính trong hành trình tìm kiếm sức mạnh tại Kitakami.",
             "Special Art Rare", "Mint", "Trainer", "N/A", "218/167", "Scarlet & Violet - Twilight Masquerade", "Tika Matsuno",
             "https://images.pokemontcg.io/sv6/218.png"},

            {"Blastoise ex SAR - 151", "Blastoise", "75.00", null, 6,
             "Blastoise ex Special Art Rare từ 151 mô tả cảnh rùa nước lặn sâu dưới lòng đại dương xanh thẳm.",
             "Special Art Rare", "Mint", "Water", "330 HP", "200/165", "Scarlet & Violet - 151", "Mitsuhiro Arita",
             "https://images.pokemontcg.io/sv3pt5/200.png"},

            {"Venusaur ex SAR - 151", "Venusaur", "65.00", "55.00", 7,
             "Venusaur ex Special Art Rare từ 151 rực rỡ sắc hoa trong rừng nhiệt đới trù phú.",
             "Special Art Rare", "Mint", "Grass", "340 HP", "198/165", "Scarlet & Violet - 151", "Yoriyuki Ikegami",
             "https://images.pokemontcg.io/sv3pt5/198.png"},

            {"Alakazam ex SAR - 151", "Alakazam", "55.00", null, 8,
             "Alakazam ex Special Art Rare ngồi thiền định giữa những chiếc thìa tâm linh bay lơ lửng.",
             "Special Art Rare", "Mint", "Psychic", "290 HP", "201/165", "Scarlet & Violet - 151", "Shinya Komatsu",
             "https://images.pokemontcg.io/sv3pt5/201.png"},

            {"Zapdos ex SAR - 151", "Zapdos", "60.00", null, 5,
             "Zapdos ex Special Art Rare bay lượn kiêu hùng cùng ba chú chim điện nhỏ trên bầu trời mây dông.",
             "Special Art Rare", "Mint", "Lightning", "200 HP", "202/165", "Scarlet & Violet - 151", "Shiburingaru",
             "https://images.pokemontcg.io/sv3pt5/202.png"},

            {"Erika's Invitation SAR - 151", "Erika", "85.00", null, 4,
             "Thư mời của Erika với hương thơm hoa cỏ nhẹ nhàng đầy thanh tao và quý phái.",
             "Special Art Rare", "Mint", "Trainer", "N/A", "203/165", "Scarlet & Violet - 151", "Cona Miura",
             "https://images.pokemontcg.io/sv3pt5/203.png"},

            {"Mewtwo V Alt Art - Pokémon GO", "Mewtwo", "45.00", null, 10,
             "Mewtwo V Alternative Art bay qua thành phố hiện đại sầm uất đầy uy lực tối thượng.",
             "Ultra Rare", "Near Mint", "Psychic", "220 HP", "072/078", "Pokémon GO", "Nurikabe",
             "https://images.pokemontcg.io/pgo/72.png"},

            {"Dragonite VSTAR - Pokémon GO", "Dragonite", "18.50", null, 15,
             "Dragonite VSTAR mang sức mạnh hủy diệt của loài rồng biển khổng lồ thân thiện.",
             "VSTAR", "Near Mint", "Dragon", "280 HP", "050/078", "Pokémon GO", "5ban Graphics",
             "https://images.pokemontcg.io/pgo/50.png"},

            {"Lugia VSTAR - Silver Tempest", "Lugia", "25.00", null, 12,
             "Lugia VSTAR phiên bản thường từ bộ Silver Tempest đại diện cho sức mạnh bão táp đại dương.",
             "VSTAR", "Near Mint", "Colorless", "280 HP", "139/195", "Silver Tempest", "Planeta Mochizuki",
             "https://images.pokemontcg.io/swsh12/139.png"},

            {"Regidrago V Alt Art - Silver Tempest", "Regidrago", "40.00", "35.00", 8,
             "Regidrago V với tạo hình đổ nát cổ xưa hùng vĩ đậm nét sử thi thần thoại.",
             "Ultra Rare", "Mint", "Dragon", "220 HP", "184/195", "Silver Tempest", "Teeziro",
             "https://images.pokemontcg.io/swsh12/184.png"},

            {"Unown V Alt Art - Silver Tempest", "Unown", "45.00", null, 6,
             "Thẻ bài Unown V Alternative Art với hàng trăm kí tự cổ tự bay lượn xung quanh bí hiểm.",
             "Ultra Rare", "Mint", "Psychic", "180 HP", "177/195", "Silver Tempest", "Toshinao Aoki",
             "https://images.pokemontcg.io/swsh12/177.png"},

            {"Serena Full Art - Silver Tempest", "Serena", "55.00", null, 5,
             "Serena Full Art Trainer đáng yêu ngọt ngào là một trong những waifu hot nhất hệ Pokémon.",
             "Ultra Rare", "Mint", "Trainer", "N/A", "193/195", "Silver Tempest", "Megumi Mizutani",
             "https://images.pokemontcg.io/swsh12/193.png"},

            {"Aerodactyl V Alt Art - Lost Origin", "Aerodactyl", "120.00", "105.00", 4,
             "Aerodactyl V Alternative Art bay lượn trên vùng đất tiền sử hoang dã tráng lệ.",
             "Ultra Rare", "Mint", "Fighting", "210 HP", "180/196", "Lost Origin", "Nurikabe",
             "https://images.pokemontcg.io/swsh11/180.png"},

            {"Origin Forme Kyurem VMAX - Lost Origin", "Kyurem", "12.00", null, 20,
             "Kyurem dạng nguyên bản với lượng băng tuyết vô tận hủy diệt mọi đối thủ ngáng đường.",
             "VMAX", "Near Mint", "Water", "330 HP", "049/196", "Lost Origin", "Kyurem",
             "https://images.pokemontcg.io/swsh11/49.png"},

            {"Origin Forme Palkia V Alt Art - Astral Radiance", "Palkia", "60.05", null, 6,
             "Origin Forme Palkia V Alternative Art bay lượn trong chiều không gian siêu thực kì vĩ.",
             "Ultra Rare", "Mint", "Water", "220 HP", "167/189", "Astral Radiance", "Oswaldo KATO",
             "https://images.pokemontcg.io/swsh10/167.png"},

            {"Origin Forme Dialga V Alt Art - Astral Radiance", "Dialga", "55.00", null, 8,
             "Origin Forme Dialga V Alternative Art ngự trị trên dòng chảy thời gian vàng son lộng lẫy.",
             "Ultra Rare", "Mint", "Metal", "220 HP", "177/189", "Astral Radiance", "Ayaka Yoshida",
             "https://images.pokemontcg.io/swsh10/177.png"},

            {"Machamp V Alt Art - Astral Radiance", "Machamp", "110.00", "95.00", 5,
             "Machamp V Alternative Art đi chợ xách đồ vô cùng hài hước và gần gũi với đời sống.",
             "Ultra Rare", "Mint", "Fighting", "220 HP", "172/189", "Astral Radiance", "Shinya Komatsu",
             "https://images.pokemontcg.io/swsh10/172.png"},

            {"Hisuian Lilligant V Alt Art - Astral Radiance", "Lilligant", "22.00", null, 14,
             "Vũ công rừng sâu Lilligant V Alt Art lướt đi nhẹ nhàng trên đồng cỏ xanh mướt.",
             "Ultra Rare", "Near Mint", "Grass", "200 HP", "163/189", "Astral Radiance", "kawayoo",
             "https://images.pokemontcg.io/swsh10/163.png"},

            {"Charizard V Alt Art - Brilliant Stars", "Charizard", "140.00", "125.00", 3,
             "Charizard V Alternative Art chiến đấu kịch tính nghẹt thở cùng Venusaur.",
             "Ultra Rare", "Mint", "Fire", "220 HP", "154/172", "Brilliant Stars", "Jiro Sasumo",
             "https://images.pokemontcg.io/swsh9/154.png"},

            {"Arceus V Alt Art - Brilliant Stars", "Arceus", "50.00", null, 7,
             "Vị thần sáng thế Arceus V lơ lửng giữa cổng thiên đường rực rỡ hào quang thần thánh.",
             "Ultra Rare", "Mint", "Colorless", "220 HP", "166/172", "Brilliant Stars", "Kinu Nishimura",
             "https://images.pokemontcg.io/swsh9/166.png"},

            {"Lumineon V Alt Art - Brilliant Stars", "Lumineon", "18.00", null, 18,
             "Lumineon V bơi sâu dưới lòng đại dương giữa đàn cá phát sáng lộng lẫy.",
             "Ultra Rare", "Near Mint", "Water", "210 HP", "156/172", "Brilliant Stars", "HYOGONOSUKE",
             "https://images.pokemontcg.io/swsh9/156.png"},

            {"Umbreon V Alt Art - Evolving Skies", "Umbreon", "95.00", null, 5,
             "Umbreon V Alternative Art ngồi đón ánh trăng trên mái nhà cổ kính đậm chất thơ.",
             "Ultra Rare", "Mint", "Darkness", "200 HP", "189/203", "Evolving Skies", "Tegara",
             "https://images.pokemontcg.io/swsh7/189.png"},

            {"Sylveon V Alt Art - Evolving Skies", "Sylveon", "75.00", "65.00", 6,
             "Sylveon V Alternative Art đi dạo cùng các pokemon nhỏ trên con phố rực rỡ sắc màu.",
             "Ultra Rare", "Mint", "Psychic", "200 HP", "184/203", "Evolving Skies", "Yuu Nishimura",
             "https://images.pokemontcg.io/swsh7/184.png"},

            {"Glaceon V Alt Art - Evolving Skies", "Glaceon", "65.00", null, 8,
             "Glaceon V Alternative Art vui đùa trên tảng băng trôi lấp lánh giữa hồ nước lạnh giá.",
             "Ultra Rare", "Mint", "Water", "210 HP", "175/203", "Evolving Skies", "Narumi Sato",
             "https://images.pokemontcg.io/swsh7/175.png"},

            {"Leafeon V Alt Art - Evolving Skies", "Leafeon", "60.00", null, 7,
             "Leafeon V Alternative Art nằm ngủ lười biếng trên đống rơm khô ấm áp.",
             "Ultra Rare", "Mint", "Grass", "210 HP", "167/203", "Evolving Skies", "Jiro Sasumo",
             "https://images.pokemontcg.io/swsh7/167.png"},

            {"Dragonite V Alt Art - Evolving Skies", "Dragonite", "110.00", null, 4,
             "Dragonite V ngủ say sưa bên cạnh những chú chim nhỏ trên bãi cỏ yên bình.",
             "Ultra Rare", "Mint", "Dragon", "230 HP", "192/203", "Evolving Skies", "Sanosuke Sakuma",
             "https://images.pokemontcg.io/swsh7/192.png"},

            {"Galarian Moltres V Alt Art - Chilling Reign", "Moltres", "135.00", "119.99", 3,
             "Chim lửa bóng tối Moltres V dang rộng đôi cánh tím rực cháy đầy ma mị bí hiểm.",
             "Ultra Rare", "Mint", "Darkness", "220 HP", "177/198", "Chilling Reign", "Shiburingaru",
             "https://images.pokemontcg.io/swsh6/177.png"},

            {"Galarian Zapdos V Alt Art - Chilling Reign", "Zapdos", "65.00", null, 5,
             "Zapdos chạy bộ siêu tốc qua mỏm đá dựng đứng hiểm trở đầy mạnh mẽ bất kham.",
             "Ultra Rare", "Mint", "Fighting", "200 HP", "174/198", "Chilling Reign", "Ryota Murayama",
             "https://images.pokemontcg.io/swsh6/174.png"},

            {"Galarian Articuno V Alt Art - Chilling Reign", "Articuno", "55.00", null, 6,
             "Articuno kiêu sa bay lướt qua rặng tuyết phủ trắng xóa lạnh lùng cô độc.",
             "Ultra Rare", "Mint", "Psychic", "210 HP", "170/198", "Chilling Reign", "Shibuzoh.",
             "https://images.pokemontcg.io/swsh6/170.png"},

            {"Blaziken VMAX Alt Art - Chilling Reign", "Blaziken", "180.00", "159.00", 2,
             "Blaziken VMAX khổng lồ tung cú đá lửa Blaze Kick làm rung chuyển cả tòa tháp cao.",
             "Secret Rare", "Mint", "Fire", "320 HP", "201/198", "Chilling Reign", "Shinya Komatsu",
             "https://images.pokemontcg.io/swsh6/201.png"},

            {"Shadow Rider Calyrex VMAX Alt Art - Chilling Reign", "Calyrex", "75.00", null, 4,
             "Kỵ sĩ bóng đêm Calyrex oai phong trên lưng linh thú hắc ám oai phong lẫm liệt.",
             "Secret Rare", "Mint", "Psychic", "320 HP", "205/198", "Chilling Reign", "kodama",
             "https://images.pokemontcg.io/swsh6/205.png"},

            {"Ice Rider Calyrex VMAX Alt Art - Chilling Reign", "Calyrex", "65.00", null, 5,
             "Kỵ sĩ băng giá Calyrex rực rỡ sương tuyết trên chiến mã bạch băng tuyệt đẹp.",
             "Secret Rare", "Mint", "Water", "320 HP", "203/198", "Chilling Reign", "Oswaldo KATO",
             "https://images.pokemontcg.io/swsh6/203.png"},

            {"Tyranitar V Alt Art - Battle Styles", "Tyranitar", "120.00", "99.99", 4,
             "Bạo chúa Tyranitar ngủ nướng no nê sau bữa tiệc trái cây thịnh soạn.",
             "Ultra Rare", "Mint", "Darkness", "230 HP", "155/163", "Battle Styles", "HYOGONOSUKE",
             "https://images.pokemontcg.io/swsh5/155.png"},

            {"Empoleon V Alt Art - Battle Styles", "Empoleon", "38.00", null, 10,
             "Hoàng đế chim cánh cụt Empoleon luyện võ cùng các môn sinh tại võ đường tuyết.",
             "Ultra Rare", "Mint", "Water", "210 HP", "146/163", "Battle Styles", "Shibuzoh.",
             "https://images.pokemontcg.io/swsh5/146.png"},

            {"Charizard VMAX - Shining Fates", "Charizard", "130.00", "115.00", 3,
             "Charizard VMAX Shiny màu đen rực lửa ngút trời cực kỳ hoành tráng và quyền lực.",
             "Shiny Rare VMAX", "Mint", "Fire", "330 HP", "SV107/SV122", "Shining Fates", "5ban Graphics",
             "https://images.pokemontcg.io/swsh45sv/SV107.png"},

            {"Suicune V - Evolving Skies", "Suicune", "15.00", null, 15,
             "Thần thú nước Suicune V phi nước đại vượt đại dương mênh mông trong gió lộng.",
             "Ultra Rare", "Near Mint", "Water", "210 HP", "031/203", "Evolving Skies", "Toyste Beach",
             "https://images.pokemontcg.io/swsh7/31.png"},

            // --- 30 CHEAP PRODUCTS UNDER $8 ---
            {"Charmander - Scarlet & Violet 151", "Charmander", "2.50", null, 30,
             "Thẻ Charmander dạng Common từ bộ sưu tập đặc biệt Scarlet & Violet 151 cực kỳ đáng yêu.",
             "Common", "Near Mint", "Fire", "70 HP", "004/165", "Scarlet & Violet - 151", "Jerky",
             "https://images.pokemontcg.io/sv3pt5/4.png"},

            {"Charmeleon - Scarlet & Violet 151", "Charmeleon", "4.99", null, 20,
             "Thẻ Charmeleon dạng Uncommon tiến hóa từ Charmander trong bộ 151.",
             "Uncommon", "Near Mint", "Fire", "90 HP", "005/165", "Scarlet & Violet - 151", "nagimiso",
             "https://images.pokemontcg.io/sv3pt5/5.png"},

            {"Pikachu - Scarlet & Violet 151", "Pikachu", "3.50", null, 40,
             "Chú chuột điện Pikachu quen thuộc phiên bản Common trong bộ sưu tập 151 huyền thoại.",
             "Common", "Near Mint", "Lightning", "60 HP", "025/165", "Scarlet & Violet - 151", "Atsushi Furusawa",
             "https://images.pokemontcg.io/sv3pt5/25.png"},

            {"Bulbasaur - Scarlet & Violet 151", "Bulbasaur", "1.99", null, 35,
             "Starter hệ Cỏ Bulbasaur số 001 dạng Common trong bộ 151.",
             "Common", "Near Mint", "Grass", "70 HP", "001/165", "Scarlet & Violet - 151", "Ryuta Murayama",
             "https://images.pokemontcg.io/sv3pt5/1.png"},

            {"Ivysaur - Scarlet & Violet 151", "Ivysaur", "3.99", null, 25,
             "Thẻ Ivysaur dạng Uncommon tiến hóa từ Bulbasaur với ngụ ý bông hoa chớm nở.",
             "Uncommon", "Near Mint", "Grass", "90 HP", "002/165", "Scarlet & Violet - 151", "sui",
             "https://images.pokemontcg.io/sv3pt5/2.png"},

            {"Squirtle - Scarlet & Violet 151", "Squirtle", "2.20", null, 30,
             "Starter hệ Nước Squirtle dạng Common vui tươi trong bộ 151.",
             "Common", "Near Mint", "Water", "60 HP", "007/165", "Scarlet & Violet - 151", "Mitsuhiro Arita",
             "https://images.pokemontcg.io/sv3pt5/7.png"},

            {"Wartortle - Scarlet & Violet 151", "Wartortle", "4.50", null, 20,
             "Thẻ Wartortle dạng Uncommon tiến hóa từ Squirtle với chiếc đuôi bọt tuyết đặc trưng.",
             "Uncommon", "Near Mint", "Water", "90 HP", "008/165", "Scarlet & Violet - 151", "Takuya Yoshizawa",
             "https://images.pokemontcg.io/sv3pt5/8.png"},

            {"Mewtwo - Scarlet & Violet 151", "Mewtwo", "6.99", null, 15,
             "Thẻ Mewtwo dạng Rare Holo đầy quyền năng tâm linh từ bộ sưu tập 151.",
             "Rare Holo", "Near Mint", "Psychic", "130 HP", "150/165", "Scarlet & Violet - 151", "Shibuzoh.",
             "https://images.pokemontcg.io/sv3pt5/150.png"},

            {"Dragonite - Silver Tempest", "Dragonite", "5.50", null, 18,
             "Rồng béo Dragonite dạng Rare Holo hiền lành nhưng mang sức mạnh to lớn.",
             "Rare Holo", "Near Mint", "Dragon", "160 HP", "131/195", "Silver Tempest", "GOSSAN",
             "https://images.pokemontcg.io/swsh12/131.png"},

            {"Eevee - Evolving Skies", "Eevee", "1.50", null, 50,
             "Eevee dạng Common vô cùng đáng yêu từ bộ sưu tập Evolving Skies.",
             "Common", "Near Mint", "Colorless", "60 HP", "125/203", "Evolving Skies", "Atsuko Nishida",
             "https://images.pokemontcg.io/swsh7/125.png"},

            {"Vaporeon - Evolving Skies", "Vaporeon", "4.99", null, 15,
             "Eevolution hệ Nước Vaporeon dạng Rare Holo tinh nghịch dưới nước.",
             "Rare Holo", "Near Mint", "Water", "110 HP", "029/203", "Evolving Skies", "Tika Matsuno",
             "https://images.pokemontcg.io/swsh7/29.png"},

            {"Jolteon - Evolving Skies", "Jolteon", "4.99", null, 15,
             "Eevolution hệ Lôi Jolteon dạng Rare Holo sắc bén đầy tia điện.",
             "Rare Holo", "Near Mint", "Lightning", "100 HP", "050/203", "Evolving Skies", "Shibuzoh.",
             "https://images.pokemontcg.io/swsh7/50.png"},

            {"Flareon - Evolving Skies", "Flareon", "4.99", null, 15,
             "Eevolution hệ Hỏa Flareon dạng Rare Holo ấm áp và rực rỡ ngọn lửa.",
             "Rare Holo", "Near Mint", "Fire", "110 HP", "026/203", "Evolving Skies", "You Iribi",
             "https://images.pokemontcg.io/swsh7/26.png"},

            {"Gengar - Lost Origin", "Gengar", "6.50", null, 12,
             "Bóng ma nghịch ngợm Gengar dạng Rare Holo từ bộ Lost Origin.",
             "Rare Holo", "Near Mint", "Psychic", "120 HP", "074/196", "Lost Origin", "Tomokazu Komiya",
             "https://images.pokemontcg.io/swsh11/74.png"},

            {"Machamp - Astral Radiance", "Machamp", "3.20", null, 20,
             "Võ sĩ bốn tay Machamp dạng Rare Holo đầy cơ bắp cuồn cuộn sức mạnh.",
             "Rare Holo", "Near Mint", "Fighting", "150 HP", "073/189", "Astral Radiance", "kawayoo",
             "https://images.pokemontcg.io/swsh10/73.png"},

            {"Lucario - Brilliant Stars", "Lucario", "3.80", null, 22,
             "Chiến binh hào quang Lucario dạng Rare Holo dũng mãnh chuẩn bị tung đòn.",
             "Rare Holo", "Near Mint", "Fighting", "120 HP", "079/172", "Brilliant Stars", "Shinji Kanda",
             "https://images.pokemontcg.io/swsh9/79.png"},

            {"Gardevoir - Astral Radiance", "Gardevoir", "4.20", null, 15,
             "Gardevoir dạng Rare Holo thanh tao và lộng lẫy sử dụng sức mạnh tâm linh bảo vệ đồng đội.",
             "Rare Holo", "Near Mint", "Psychic", "140 HP", "069/189", "Astral Radiance", "Atsushi Furusawa",
             "https://images.pokemontcg.io/swsh10/69.png"},

            {"Togekiss - Lost Origin", "Togekiss", "2.99", null, 25,
             "Pokémon hạnh phúc Togekiss dạng Rare Holo dang rộng đôi cánh mang điềm lành.",
             "Rare Holo", "Near Mint", "Colorless", "130 HP", "149/196", "Lost Origin", "Narumi Sato",
             "https://images.pokemontcg.io/swsh11/149.png"},

            {"Snorlax - Lost Origin", "Snorlax", "5.99", null, 18,
             "Chú lười Snorlax dạng Rare Holo to khỏe thích ăn và ngủ từ Lost Origin.",
             "Rare Holo", "Near Mint", "Colorless", "150 HP", "143/196", "Lost Origin", "You Iribi",
             "https://images.pokemontcg.io/swsh11/143.png"},

            {"Lapras - Crown Zenith", "Lapras", "3.50", null, 25,
             "Lapras hiền hòa dạng Rare Holo chở các trainer vượt sóng gió đại dương.",
             "Rare Holo", "Near Mint", "Water", "110 HP", "036/159", "Crown Zenith", "Kanto",
             "https://images.pokemontcg.io/swsh12pt5/36.png"},

            {"Gyarados - Scarlet & Violet", "Gyarados", "5.20", null, 12,
             "Rồng biển thịnh nộ Gyarados dạng Rare Holo cuộn trào sóng nước dữ dội.",
             "Rare Holo", "Near Mint", "Water", "180 HP", "044/198", "Scarlet & Violet", "Planeta Yamashita",
             "https://images.pokemontcg.io/sv1/44.png"},

            {"Arcanine - Scarlet & Violet", "Arcanine", "3.50", null, 20,
             "Chó lửa dũng mãnh Arcanine dạng Rare Holo với bộ lông vàng rực lửa.",
             "Rare Holo", "Near Mint", "Fire", "130 HP", "032/198", "Scarlet & Violet", "Hitoshi Ariga",
             "https://images.pokemontcg.io/sv1/32.png"},

            {"Raichu - Paldea Evolved", "Raichu", "4.20", null, 16,
             "Phiên bản tiến hóa Raichu dạng Rare Holo phóng điện sấm sét cực mạnh.",
             "Rare Holo", "Near Mint", "Lightning", "120 HP", "071/193", "Paldea Evolved", "Sanosuke Sakuma",
             "https://images.pokemontcg.io/sv2/71.png"},

            {"Mew - Crown Zenith", "Mew", "5.80", null, 14,
             "Pokémon huyền thoại Mew dạng Rare Holo trôi nổi bồng bềnh lấp lánh.",
             "Rare Holo", "Near Mint", "Psychic", "90 HP", "076/159", "Crown Zenith", "Ryuta Murayama",
             "https://images.pokemontcg.io/swsh12pt5/76.png"},

            {"Zapdos - Crown Zenith", "Zapdos", "5.50", null, 15,
             "Chim sét huyền thoại Zapdos dạng Rare Holo đầy uy lực từ Crown Zenith.",
             "Rare Holo", "Near Mint", "Lightning", "110 HP", "041/159", "Crown Zenith", "Teeziro",
             "https://images.pokemontcg.io/swsh12pt5/41.png"},

            {"Articuno - Crown Zenith", "Articuno", "5.50", null, 15,
             "Chim băng huyền thoại Articuno dạng Rare Holo tuyệt đẹp lạnh lùng từ Crown Zenith.",
             "Rare Holo", "Near Mint", "Water", "110 HP", "025/159", "Crown Zenith", "GIDORA",
             "https://images.pokemontcg.io/swsh12pt5/25.png"},

            {"Moltres - Crown Zenith", "Moltres", "5.50", null, 15,
             "Chim lửa huyền thoại Moltres dạng Rare Holo với ngọn lửa cháy bất diệt từ Crown Zenith.",
             "Rare Holo", "Near Mint", "Fire", "120 HP", "021/159", "Crown Zenith", "Akira Komayama",
             "https://images.pokemontcg.io/swsh12pt5/21.png"},

            {"Tyranitar - Obsidian Flames", "Tyranitar", "6.99", null, 10,
             "Khủng long bóng tối Tyranitar dạng Rare Holo vững chãi kiêu hùng từ Obsidian Flames.",
             "Rare Holo", "Near Mint", "Darkness", "180 HP", "135/197", "Obsidian Flames", "kawayoo",
             "https://images.pokemontcg.io/sv3/135.png"},

            {"Steelix - Temporal Forces", "Steelix", "3.20", null, 20,
             "Rắn thép Steelix dạng Rare Holo mình đồng da sắt cứng cáp từ Temporal Forces.",
             "Rare Holo", "Near Mint", "Metal", "180 HP", "115/162", "Temporal Forces", "GOSSAN",
             "https://images.pokemontcg.io/sv5/115.png"},

            {"Rayquaza - Crown Zenith", "Rayquaza", "7.50", null, 10,
             "Rồng lục Rayquaza dạng Rare Holo bay lượn từ tầng bình lưu đầy huyền thoại.",
             "Rare Holo", "Near Mint", "Dragon", "130 HP", "100/159", "Crown Zenith", "Shiburingaru",
             "https://images.pokemontcg.io/swsh12pt5/100.png"}
        };

        int seededCount = 0;
        for (Object[] data : cardData) {
            String name = (String) data[0];
            if (productRepository.findByName(name).isEmpty()) {
                Product product = Product.builder()
                        .name(name)
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
                seededCount++;
            }
        }
        if (seededCount > 0) {
            log.info("Seeded {} new Pokemon cards successfully.", seededCount);
        }

        if (storeLocationRepository.count() == 0) {
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
        }

        if (notificationRepository.count() == 0) {
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
                    .endTime(now.plusHours(24))
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
                    .endTime(now.plusHours(36))
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
                    .endTime(now.plusHours(48))
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
                    .endTime(now.plusHours(72))
                    .status("active")
                    .createdByAdmin(false)
                    .bidHistory(new java.util.ArrayList<>())
                    .build());

            auctionRepository.saveAll(defaults);
            log.info("Seeded 4 default live auctions.");
        }
    }
}
