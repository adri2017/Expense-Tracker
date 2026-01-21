package com.adrian.expense_tracker;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class ExpenseService {

    private final ExpenseRepository repo;

    public ExpenseService(ExpenseRepository repo) {
        this.repo = repo;
    }

    public List<Expense> getAll() {
        return repo.findAll();
    }

    public Expense create(Expense expense) {
        return repo.save(expense);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    public List<Expense> byRange(LocalDate start, LocalDate end) {
        return repo.findByExpenseDateBetween(start, end);
    }

    public List<Expense> byCategory(String category) {
        return repo.findByCategory(category);
    }
}