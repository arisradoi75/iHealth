package com.ex.core.entities;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Address {
    private String country;
    private String county;
    private String city;
    private String street;
    private String zipCode;
    private String number;
}