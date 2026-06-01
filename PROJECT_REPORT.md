# POKÉMON CARD MARKETPLACE SYSTEM - PROJECT REPORT

---

## 1. Requirements

This section details the Project Development Requirements set by the course rubric (matching our Flutter & Spring Boot tech stack) along with the System Requirements (Functional and Non-Functional) designed for our Pokémon Card Marketplace application.

### 1.1 Course Development Requirements
As per the project specification guidelines, our system has been designed and implemented to satisfy the following development requirements:
*   **UI Implementation:** Built using Flutter (Dart SDK) with custom widgets, responsive grid layouts, and material designs for the mobile client, and React JS (Vite + Tailwind CSS) for the administrator web console.
*   **State Management:** State is managed on the client side using the **Provider** state package, allowing reactive UI updates when cart counts, user sessions, or auction values change. Session tokens and profiles are persisted locally using `shared_preferences`.
*   **Local or Remote Database:** Utilizes a remote MySQL 8.0 database mapped via Spring Data JPA entities, featuring eager relationship mappings and dynamic caching using Spring Cache.
*   **Deployment Requirement:** 
    *   **Docker Containerization:** Docker Compose setup orchestrating MySQL, Spring Boot Backend JAR, and React Frontend Nginx bundle.
    *   **Release APK:** Mobile client is compiled into a standalone Android Release APK using Flutter build commands (`flutter build apk --release`).
*   **Testing Requirement:**
    *   **Unit Test:** Written in Java (JUnit 5 + Mockito) to validate critical backend business logic (Trade Score Mismatch validation).
    *   **Widget / Component Test:** Implemented in Dart (Flutter Test) to ensure metadata and card detail widgets render correctly on device screens.

### 1.2 System Functional Requirements (FRs)
The application defines features for two distinct roles: `USER` (Trainer) and `ADMIN` (Store Manager).

*   **FR-1: Authentication & Authorization:** Users register accounts, log in to acquire JWT access and refresh tokens, and log out. Roles restrict access to admin-only or user-only actions.
*   **FR-2: Card Catalog Search & Filtering:** View all Pokémon cards with native server-side pagination, search by name, filter by rarity and price, and sort by deck strength score.
*   **FR-3: Shopping Cart & Order Checkout:** Add cards to cart, adjust quantity, verify database stock, and place orders.
*   **FR-4: Marketplace Listings:** Users can list cards from their virtual collections for sale at custom prices.
*   **FR-5: Live Card Auctions:** Admin can list rare cards for auction. Users submit incremental bids. The system validates bids in real-time and auto-closes the auction on end time.
*   **FR-6: Peer-to-Peer Trading Desk:** Users propose card-for-card swaps. The system applies the "Fair Trade" rule, restricting proposals if the score difference between offered and requested cards exceeds 1.5.
*   **FR-7: Pack Simulator (Gacha):** Users can buy and open randomized cards to add to their personal inventory.
*   **FR-8: Customer Live Support:** Real-time messaging service between users and administrators.
*   **FR-9: Locations Directory:** View geographic locations and addresses of partner brick-and-mortar stores.
*   **FR-10: In-App Notifications:** Real-time notifications for trade updates, bidding activity, and order changes.

### 1.3 System Non-Functional Requirements (NFRs)
*   **NFR-1: Security:** Password hashing using BCrypt. Stateless API endpoints secured via JWT filters with token rotation.
*   **NFR-2: Performance:** Relationship eager-loading (preventing N+1 queries) and API response caching.
*   **NFR-3: Scalability:** Easily containerized microservices ready for cloud hosting (e.g. Railway, AWS).
*   **NFR-4: Compatibility:** Responsiveness across various Android and iOS screen sizes.

---

## 2. Project sample

### 2.1 Case Study: Pokémon Card Marketplace & Trading System
The selected business domain is the **Collectible Trading Card Game (TCG) Marketplace**. Over the past decade, collectible trading cards (like Pokémon, Magic: The Gathering, and Yu-Gi-Oh!) have evolved from mere toys into high-value investment assets. Rare cards are traded for thousands of dollars.

```
       ┌─────────────────────────────────────────────────────────┐
       │             POKÉMON CARD MARKETPLACE DOMAIN             │
       └────────────────────────────┬────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
┌─────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   E-Commerce    │       │ Peer-to-Peer Swaps│      │  Gacha Simulator │
│ Buy/Sell cards  │       │ Fair-Trade Checks│      │ Open Booster Packs│
└─────────────────┘       └──────────────────┘       └──────────────────┘
```

### 2.2 Core Business Challenges Solved
1.  **Price & Quality Transparency:** Pokémon cards vary in price depending on their condition (Mint, Near Mint, Played). The system mandates that listings specify card condition, and it automatically computes a "Deck Score" to help buyers assess utility.
2.  **Scam Prevention in Trading:** Direct trading between collectors online is notorious for scams. By executing trades entirely in-app and validating the card "Deck Score" difference (restricting trades if the difference exceeds 1.5), we protect young or inexperienced collectors from unfair trades.
3.  **Gamified Engagement:** By incorporating a Pack Simulator (Gacha style) and Live Auctions, the application increases daily active user retention.

---

## 3. Member

### 3.1 Team Introduction
Our team consists of 4 members working together to design the database, build the APIs, create the mobile interfaces, and run tests.

*   **Member 1: Nguyễn Văn A (Team Leader & Backend Developer)**
    *   *Role:* Backend Architecture, JWT Security, Database Mappings, Docker Config.
*   **Member 2: Trần Thị B (Lead Mobile Developer)**
    *   *Role:* Flutter UI, Providers State Management, SharedPreferences, API Integrations.
*   **Member 3: Lê Văn C (Web Admin & Mobile UI Developer)**
    *   *Role:* React Web Admin Dashboard, Styling, Mobile layouts optimization.
*   **Member 4: Phạm Thị D (Tester & Business Analyst)**
    *   *Role:* Testing (JUnit, Flutter Test), Document compilation, Functional Analysis.

### 3.2 Contribution Evaluation Matrix

The workload is distributed among members as follows:

| Topic | Effort | Nguyễn Văn A | Trần Thị B | Lê Văn C | Phạm Thị D |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Case Study Analysis** | 100% | 20% | 20% | 20% | 40% |
| **Business Analysis** | 100% | 20% | 25% | 15% | 40% |
| **System Design** | 100% | 40% | 30% | 15% | 15% |
| **Implementation** | 100% | 45% | 35% | 20% | 0% |
| **Documentation** | 100% | 10% | 20% | 20% | 50% |
| **Final Contribution** | **100%** | **30%** | **30%** | **20%** | **20%** |

---

## 4. Tech

### 4.1 Technology Stack
The application is built on a split fullstack structure:

*   **Backend Framework:** Spring Boot 3.2.5, Spring Security, Jakarta Validation.
*   **Database & Cache:** MySQL 8.0, Spring Data JPA, Hibernate, Spring Cache.
*   **Mobile App Framework:** Flutter (Dart SDK) using Provider package.
*   **Frontend Admin Panel:** React (Vite) + Tailwind CSS.
*   **Deployment & DevOps:** Docker Compose, Local APK release compiling.

### 4.2 Application Architecture
The mobile application uses the **MVVM (Model-View-ViewModel)** design pattern implemented in Flutter:

```mermaid
graph LR
    subgraph View
        V[Flutter Widget Screens]
    end
    subgraph ViewModel
        VM[Dart Providers / State / Api Callers]
    end
    subgraph Model
        M[Spring Boot APIs / MySQL Data]
    end
    V <=>|Data Binding & State Triggers| VM
    VM <=>|JSON HTTP Requests| M
```

1.  **Model:** Spring Boot REST endpoints supplying entity structures (`Product`, `User`, `Trade`, etc.).
2.  **View:** Flutter Screens (e.g. `ProductDetailScreen`, `TradeDashboardScreen`) defining the widget layouts.
3.  **ViewModel:** Flutter **Providers** (`AuthProvider`, `CartProvider`, `MarketProvider`) which handle state notifications, perform HTTP requests via `ApiService`, and rebuild the UI reactively.

### 4.3 New Technologies Explored
*   **Flutter Provider Architecture:** Avoided prop-drilling by creating a global dependency injection tree, reactively updating widget trees only when data changes.
*   **Token Refresh Queue in Dart:** Developed custom JWT interceptor logic in `api_service.dart`. When an access token expires (401), pending HTTP requests pause while a new access token is requested via the refresh token endpoint, saving it to `SharedPreferences` and retrying original requests.
*   **Dynamic Algorithmic Score Generation:** Pre-persist listeners in Spring Boot calculate the power rating of Pokémon cards based on stats automatically.

---

## 5. Main Functions Specification

### 5.1 Business Functions & Flow Description

```
   [User Dashboard]
          │
          ├──► Catalog & Search  ──► Product Details ──► [Add to Cart] / [Propose Trade]
          ├──► Pack Simulator    ──► Random Gacha     ──► Adds to [My Collection]
          ├──► Live Auctions     ──► Submit Bid       ──► Updates [Auction Board]
          └──► Live Support Chat ──► Direct Message   ──► Admin Reply
```

*   **Authentication Flow:** User enters credentials $\rightarrow$ Password verified via BCrypt $\rightarrow$ Server returns Access Token (JWT) & Refresh Token.
*   **Fair Trading Flow:** User A proposes swapping `Card A` for User B's `Card B` $\rightarrow$ Server calculates:
    $$\Delta = |Score(A) - Score(B)|$$
    If $\Delta > 1.5$, transaction is rejected immediately with a `TradeScoreMismatchException`.
*   **Live Auction Flow:** Admin lists card $\rightarrow$ Users bid $\rightarrow$ Server updates `currentBid` and `highestBidder` $\rightarrow$ Once `endTime` is reached, background scheduler marks status as `COMPLETED`.

---

### 5.2 Database Design & Clarifications
The schema contains 11 primary tables. Due to course requirements, we mapped the Pokémon card model properties to legacy entity fields:

| Database Column | Logical Entity Attribute | Description |
| :--- | :--- | :--- |
| `brand` | Pokémon Name | The specific name of the Pokémon (e.g., Charizard, Pikachu). |
| `cpu` | Card Type | Category of the card (e.g., Pokémon, Energy, Trainer, Sealed). |
| `camera` | HP (Hit Points) | The card’s health points (e.g., 310 HP). Used in score calculation. |
| `battery` | Card ID / Number | Serial number of the card in the expansion set (e.g., 188/202). |
| `ram` | Rarity | Rarity level of the card (e.g., Ultra Rare, Common, Holo). |
| `rom` | Card Condition | Physical state of the card (e.g., Mint, Near Mint, Played). |
| `screen` | Expansion Set | The TCG expansion set (e.g., Darkness Ablaze, Sword & Shield). |
| `os` | Card Artist | The illustrator of the card (e.g., Ken Sugimori). |

#### JPA Entity Relationship Layout:
1.  **User (`users`):** Represents users and admins.
2.  **Product (`products`):** Contains Pokémon card specifications (using table mapping above).
3.  **Listing (`listings`):** Active card listings uploaded by users for direct purchase.
4.  **Trade (`trades`):** Card-to-card swap proposals.
5.  **Auction (`auctions`):** Real-time bidding listings.
6.  **AuctionBid (`auction_bids`):** Bid history records linked to Auctions.
7.  **CartItem (`cart_items`):** Items in user carts.
8.  **Order (`orders`) & OrderItem (`order_items`):** finalized sales logs.
9.  **ChatMessage (`chat_messages`):** Support communication logs.
10. **StoreLocation (`store_locations`):** Geographic points for partner stores.

---

## 6. Submit

### 6.1 Deliverables & Code Guidelines
*   **Source Code Bundle:** Complete zipped package uploaded containing backend Spring Boot logic, frontend React codebase, and **Flutter mobile App directory**.
*   **Comments & Documentation:** All source files contain extensive header comments and method Javadocs explaining business logic rules.

### 6.2 Testing Requirements & Proof

#### 1. Backend JUnit & Mockito Unit Test
Validates the trade engine prevents unfair trades (score difference > 1.5):

```java
package com.pokemon.marketplace.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import com.pokemon.marketplace.entity.Product;
import com.pokemon.marketplace.exception.TradeScoreMismatchException;

@ExtendWith(MockitoExtension.class)
public class TradeServiceTest {

    @InjectMocks
    private TradeService tradeService;

    @Test
    public void testProposeTrade_ShouldThrowException_WhenScoreDifferenceExceedsLimit() {
        // Card A Score: 2.5
        Product offeredCard = Product.builder()
                .id(1L)
                .price(new BigDecimal("25.0"))
                .camera("60 HP")
                .score(2.5) 
                .build();

        // Card B Score: 6.0 (Difference = 3.5 > 1.5)
        Product requestedCard = Product.builder()
                .id(2L)
                .price(new BigDecimal("200.0"))
                .camera("300 HP")
                .score(6.0) 
                .build();

        assertThrows(TradeScoreMismatchException.class, () -> {
            tradeService.validateTradeScores(offeredCard, requestedCard);
        });
    }
}
```

#### 2. Flutter Widget/Component Test (Dart)
Ensures the UI components correctly render Pokémon details:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import '../lib/models/product.dart';

void main() {
  testWidgets('Should render Pokémon Card information correctly in details UI card', (WidgetTester tester) async {
    final mockProduct = Product(
      id: 10,
      name: 'Charizard VMAX',
      brand: 'Charizard',
      price: 150.0,
      stock: 3,
      isAvailable: true,
      score: 5.5,
      cpu: 'Pokémon Card',
      camera: '330 HP',
      ram: 'Ultra Rare',
      rom: 'Mint',
    );

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: Column(
            children: [
              Text(mockProduct.name),
              Text(mockProduct.brand),
              Text(mockProduct.cpu ?? ''),
              Text(mockProduct.camera ?? ''),
              Text(mockProduct.ram ?? ''),
              Text(mockProduct.rom ?? ''),
            ],
          ),
        ),
      ),
    );

    // Verify information is displayed correctly on screen
    expect(find.text('Charizard VMAX'), findsOneWidget);
    expect(find.text('Charizard'), findsOneWidget);
    expect(find.text('330 HP'), findsOneWidget);
    expect(find.text('Ultra Rare'), findsOneWidget);
    expect(find.text('Mint'), findsOneWidget);
  });
}
```

---

### 6.3 Deployment & Running in Release Mode
*   **Docker Container Orchestration:** Run the production environment using:
    ```bash
    docker-compose up --build -d
    ```
    This launches MySQL database, Spring Boot API, and Nginx serving React Web Admin.
*   **Mobile Release APK Compilation:** Built standalone release package using Flutter build system:
    ```bash
    flutter build apk --release
    ```
    This outputs the statically optimized Android binary file (`app-release.apk`) ready for device deployment.

---

### 6.4 Conclusion & Discussion

#### Pros:
1.  **Security & Stability:** Dynamic token rotation protects user sessions.
2.  **Fair Exchange Engine:** Score validation prevents unfair exchanges.
3.  **Cross-Platform Performance:** Flutter UI compiles directly to ARM code, ensuring high framerate animations on Gacha pack openings.

#### Cons:
1.  **Database Naming Legacy:** Database fields are named after phone specifications (`camera`, `cpu`, etc.) rather than proper TCG properties (`hp`, `card_type`).
2.  **Notification Polling:** Uses HTTP polling rather than Firebase Cloud Messaging (FCM).

#### Future Enhancements:
1.  **Database Refactoring:** Migrate and rename columns to proper card properties.
2.  **WebSockets:** Replace HTTP polling with active WebSockets for instant bidding and chat updates.
3.  **Real Payment Gateway:** Connect Sandbox VNPay APIs to process live monetary top-ups.
