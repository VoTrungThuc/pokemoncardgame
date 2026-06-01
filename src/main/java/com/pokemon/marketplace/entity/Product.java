package com.pokemon.marketplace.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    
    @Column(name = "pokemon_name", nullable = false)
    private String brand;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(name = "promo_price")
    private BigDecimal promoPrice;

    @Column(length = 2000)
    private String description;

    
    private String ram;

    
    private String rom;

    
    private String cpu;

    
    private String camera;

    
    private String battery;

    
    private String screen;

    
    private String os;

    @Column(nullable = false)
    private Integer stock;

    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable;

    @Column(name = "score")
    private Double score;

    @PrePersist
    @PreUpdate
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
