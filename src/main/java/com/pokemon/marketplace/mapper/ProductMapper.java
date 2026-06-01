package com.pokemon.marketplace.mapper;

import com.pokemon.marketplace.dto.ProductDTO;
import com.pokemon.marketplace.entity.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public ProductDTO toDTO(Product product) {
        if (product == null) return null;
        return ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .brand(product.getBrand())
                .imageUrl(product.getImageUrl())
                .price(product.getPrice())
                .promoPrice(product.getPromoPrice())
                .description(product.getDescription())
                .ram(product.getRam())
                .rom(product.getRom())
                .cpu(product.getCpu())
                .camera(product.getCamera())
                .battery(product.getBattery())
                .screen(product.getScreen())
                .os(product.getOs())
                .stock(product.getStock())
                .isAvailable(product.getIsAvailable())
                .score(product.getScore())
                .build();
    }
}
