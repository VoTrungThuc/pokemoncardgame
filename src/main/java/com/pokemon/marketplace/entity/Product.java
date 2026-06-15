package com.pokemon.marketplace.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.math.BigDecimal;

@Document(collection = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    private Long id;

    private String name;

    @Field("pokemon_name")
    private String brand;

    @Field("image_url")
    private String imageUrl;

    private BigDecimal price;

    @Field("promo_price")
    private BigDecimal promoPrice;

    private String description;

    private String ram;

    private String rom;

    private String cpu;

    private String camera;

    private String battery;

    private String screen;

    private String os;

    private Integer stock;

    @Field("is_available")
    private Boolean isAvailable;

    private Double score;

    public void calculateScore() {
        if (this.price == null) {
            this.score = 1.0;
            return;
        }
        double calculated = 2.0 + (this.price.doubleValue() / 50.0);
        if (this.camera != null) {
            try {
                String hpStr = this.camera.replaceAll("[^0-9]", "");
                if (!hpStr.isEmpty()) {
                    calculated += Double.parseDouble(hpStr) / 100.0;
                }
            } catch (Exception ignored) {}
        }
        double val = Math.max(1.0, Math.min(10.0, calculated));
        this.score = Math.round(val * 10.0) / 10.0;
    }
}
