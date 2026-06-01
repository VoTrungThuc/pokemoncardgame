package com.pokemon.marketplace.repository;

import com.pokemon.marketplace.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p WHERE " +
           "(:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:brand IS NULL OR LOWER(p.brand) = LOWER(:brand)) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
           "(:isAvailable IS NULL OR p.isAvailable = :isAvailable) AND " +
           "(:isPromo IS NULL OR (:isPromo = true AND p.promoPrice IS NOT NULL AND p.promoPrice < p.price))")
    Page<Product> filterProducts(
            @Param("name") String name,
            @Param("brand") String brand,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("isAvailable") Boolean isAvailable,
            @Param("isPromo") Boolean isPromo,
            Pageable pageable);
}
