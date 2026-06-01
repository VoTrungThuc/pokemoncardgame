package com.pokemon.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreLocationDTO {
    private Long id;
    private String name;
    private String address;
    private String phone;
    private String workingHours;
    private Double latitude;
    private Double longitude;
}
