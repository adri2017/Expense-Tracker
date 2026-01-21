package com.adrian.expense_tracker;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByExpenseDateBetween(LocalDate start, LocalDate end);
    List<Expense> findByCategory(String category);
}
