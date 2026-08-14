package com.cdac.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cdac.entities.Admin;

public interface AdminRepository extends JpaRepository<Admin, Long>{

}
