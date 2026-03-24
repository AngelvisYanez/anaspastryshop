```mermaid
erDiagram

  "User" {
    String id "🗝️"
    String name "❓"
    String email 
    String password 
    String role 
    String image "❓"
    DateTime createdAt 
    DateTime updatedAt 
    }
  

  "Taller" {
    String id "🗝️"
    String title 
    String description 
    String category 
    Float price 
    DateTime date 
    String time 
    String location 
    Boolean isOnline 
    Int slots 
    String image "❓"
    String agenda "❓"
    String includes "❓"
    DateTime createdAt 
    }
  

  "Curso" {
    String id "🗝️"
    String title 
    String description 
    String image "❓"
    Float price 
    Int totalHours 
    Int totalClasses 
    String language 
    String level 
    String content "❓"
    String modules "❓"
    DateTime createdAt 
    }
  

  "Inscription" {
    String id "🗝️"
    String status 
    String method 
    String reference "❓"
    String phoneNumber "❓"
    String receiptImage "❓"
    Float amountPaid 
    DateTime createdAt 
    DateTime updatedAt 
    }
  

  "Category" {
    String id "🗝️"
    String name 
    DateTime createdAt 
    }
  

  "ActivityLog" {
    String id "🗝️"
    String action 
    String entityType 
    String entityId "❓"
    String details "❓"
    DateTime createdAt 
    }
  
    "Taller" }o--|| "User" : "instructor"
    "Curso" }o--|| "User" : "instructor"
    "Inscription" }o--|o "Curso" : "curso"
    "Inscription" }o--|o "Taller" : "taller"
    "Inscription" }o--|| "User" : "user"
    "ActivityLog" }o--|| "User" : "user"
```
