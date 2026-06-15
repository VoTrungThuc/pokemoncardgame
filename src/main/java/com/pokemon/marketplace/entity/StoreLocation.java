package com.pokemon.marketplace.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "store_locations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreLocation {

    @Id
    private Long id;

    private String name;

    private String address;

    private String phone;

    @Field("working_hours")
    private String workingHours;

    private Double latitude;

    private Double longitude;
}
