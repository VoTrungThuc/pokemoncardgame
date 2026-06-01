package com.pokemon.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDTO {
    private Long id;
    private String name;
    private String brand;          
    private String imageUrl;
    private BigDecimal price;
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
    private Boolean isAvailable;
    private Double score;
}
