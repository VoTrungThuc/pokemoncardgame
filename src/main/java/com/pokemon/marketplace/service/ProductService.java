package com.pokemon.marketplace.service;

import com.pokemon.marketplace.dto.ProductDTO;
import com.pokemon.marketplace.entity.Product;
import com.pokemon.marketplace.exception.ResourceNotFoundException;
import com.pokemon.marketplace.mapper.ProductMapper;
import com.pokemon.marketplace.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.support.PageableExecutionUtils;
import org.bson.Document;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final MongoTemplate mongoTemplate;

    public Page<ProductDTO> getFilteredProducts(
            String name, String brand, BigDecimal minPrice, BigDecimal maxPrice,
            Boolean isAvailable, Boolean isPromo, Pageable pageable) {
        log.info("Filtering products by Name: {}, Brand: {}, Price Range: [{}, {}]", name, brand, minPrice, maxPrice);
        
        Query query = new Query();
        
        if (name != null && !name.trim().isEmpty()) {
            query.addCriteria(Criteria.where("name").regex(name, "i"));
        }
        if (brand != null && !brand.trim().isEmpty()) {
            query.addCriteria(Criteria.where("pokemon_name").regex("^" + brand + "$", "i"));
        }
        if (minPrice != null) {
            query.addCriteria(Criteria.where("price").gte(minPrice));
        }
        if (maxPrice != null) {
            query.addCriteria(Criteria.where("price").lte(maxPrice));
        }
        if (isAvailable != null) {
            query.addCriteria(Criteria.where("is_available").is(isAvailable));
        }
        if (isPromo != null && isPromo) {
            query.addCriteria(Criteria.where("promo_price").ne(null));
            query.addCriteria(Criteria.where("$expr").is(new Document("$lt", java.util.List.of("$promo_price", "$price"))));
        }
        
        long total = mongoTemplate.count(query, Product.class);
        query.with(pageable);
        java.util.List<Product> list = mongoTemplate.find(query, Product.class);
        
        return PageableExecutionUtils.getPage(list, pageable, () -> total)
                .map(productMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
        return productMapper.toDTO(product);
    }

    @Transactional
    public ProductDTO createProduct(ProductDTO dto) {
        log.info("Creating new product: {}", dto.getName());
        Product product = Product.builder()
                .name(dto.getName())
                .brand(dto.getBrand())
                .imageUrl(dto.getImageUrl())
                .price(dto.getPrice())
                .promoPrice(dto.getPromoPrice())
                .description(dto.getDescription())
                .ram(dto.getRam())
                .rom(dto.getRom())
                .cpu(dto.getCpu())
                .camera(dto.getCamera())
                .battery(dto.getBattery())
                .screen(dto.getScreen())
                .os(dto.getOs())
                .stock(dto.getStock() != null ? dto.getStock() : 0)
                .isAvailable(dto.getIsAvailable() != null ? dto.getIsAvailable() : true)
                .build();

        Product saved = productRepository.save(product);
        return productMapper.toDTO(saved);
    }

    @Transactional
    public ProductDTO updateProduct(Long id, ProductDTO dto) {
        log.info("Updating product ID: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        product.setName(dto.getName());
        product.setBrand(dto.getBrand());
        product.setImageUrl(dto.getImageUrl());
        product.setPrice(dto.getPrice());
        product.setPromoPrice(dto.getPromoPrice());
        product.setDescription(dto.getDescription());
        product.setRam(dto.getRam());
        product.setRom(dto.getRom());
        product.setCpu(dto.getCpu());
        product.setCamera(dto.getCamera());
        product.setBattery(dto.getBattery());
        product.setScreen(dto.getScreen());
        product.setOs(dto.getOs());
        product.setStock(dto.getStock() != null ? dto.getStock() : product.getStock());
        product.setIsAvailable(dto.getIsAvailable() != null ? dto.getIsAvailable() : product.getIsAvailable());

        Product saved = productRepository.save(product);
        return productMapper.toDTO(saved);
    }

    @Transactional
    public void deleteProduct(Long id) {
        log.info("Deleting product ID: {}", id);
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with ID: " + id);
        }
        productRepository.deleteById(id);
    }
}
