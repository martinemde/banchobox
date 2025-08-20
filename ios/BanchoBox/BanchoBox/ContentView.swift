//
//  ContentView.swift
//  BanchoBox
//
//  Created by Cardiff Emde on 8/19/25.
//

import SwiftUI

// MARK: - Models

struct PartyDish: Codable, Identifiable {
    let id: Int
    let partyId: Int
    let dishId: Int
    let partyPrice: Double
    let partyRevenue: Double
    let profit: Double
    let profitPerServing: Double
}

struct EnrichedIngredient: Codable, Identifiable {
    let id: Int
    let name: String
    let source: String?
    let type: String?
    let drone: Int
    let kg: Double?
    let max_meats: Int?
    let cost: Double?
    let usedIn: [UsedIn]
    let bestPartyDishId: Int?
    let usedForParties: [Int]

    struct UsedIn: Codable, Identifiable {
        var id: Int { dishId }
        let dishId: Int
        let count: Int
    }
}

struct EnrichedParty: Codable, Identifiable {
    let id: Int
    let name: String
    let bonus: Double
    let order: Int
    let partyDishIds: [Int]
}

struct EnrichedDish: Codable, Identifiable {
    struct IngredientLine: Codable, Identifiable {
        var id: Int { ingredientId }
        let ingredientId: Int
        let count: Int
        let unitCost: Double?
        let lineCost: Double
        let upgradeCount: Int?
    }

    let id: Int
    let name: String
    let final_level: Int
    let final_taste: Int
    let initial_price: Double
    let final_price: Double
    let servings: Int
    let unlock_condition: String?
    let dlc: String?
    let ingredients: [IngredientLine]
    let recipeCost: Double
    let partyDishIds: [Int]
    let bestPartyDishId: Int?
    let maxProfitPerDish: Double
    let baseRevenue: Double
    let baseProfit: Double
    let baseProfitPerServing: Double
    let maxProfitPerServing: Double
    let upgradeCost: Double
    let upgradeBreakEven: Double
    let ingredientCount: Int
    let bestPartyName: String?
    let bestPartyBonus: Double?
    let bestPartyPrice: Double?
    let bestPartyRevenue: Double?
}

// MARK: - Data Store

@MainActor
final class DataStore: ObservableObject {
    @Published var dishes: [EnrichedDish] = []
    @Published var ingredients: [EnrichedIngredient] = []
    @Published var parties: [EnrichedParty] = []
    @Published var partyDishes: [PartyDish] = []

    private let decoder: JSONDecoder = {
        let d = JSONDecoder()
        d.keyDecodingStrategy = .useDefaultKeys
        return d
    }()

    func loadIfNeeded() async {
        guard dishes.isEmpty else { return }
        await load()
    }

    func load() async {
        do {
            dishes = try loadJSON("dishes.v1", in: "Web/data", as: [EnrichedDish].self)
            ingredients = try loadJSON("ingredients.v1", in: "Web/data", as: [EnrichedIngredient].self)
            parties = try loadJSON("parties.v1", in: "Web/data", as: [EnrichedParty].self)
            partyDishes = try loadJSON("party-dishes.v1", in: "Web/data", as: [PartyDish].self)
        } catch {
            print("Data load failed: \(error)")
        }
    }

    private func loadJSON<T: Decodable>(_ name: String, in subdirectory: String, as type: T.Type) throws -> T {
        guard let url = Bundle.main.url(forResource: name, withExtension: "json", subdirectory: subdirectory) else {
            throw NSError(domain: "DataStore", code: 1, userInfo: [NSLocalizedDescriptionKey: "Missing resource \(name).json in \(subdirectory)"])
        }
        let data = try Data(contentsOf: url)
        return try decoder.decode(T.self, from: data)
    }

    func partyDish(by id: Int) -> PartyDish? {
        partyDishes.first { $0.id == id }
    }
}

// MARK: - Views

struct ContentView: View {
    @StateObject private var store = DataStore()

    var body: some View {
        TabView {
            NavigationStack {
                DishesListView()
                    .environmentObject(store)
                    .navigationTitle("Dishes")
            }
            .tabItem { Label("Dishes", systemImage: "fork.knife") }

            NavigationStack {
                IngredientsListView()
                    .environmentObject(store)
                    .navigationTitle("Ingredients")
            }
            .tabItem { Label("Ingredients", systemImage: "leaf") }

            NavigationStack {
                PartiesListView()
                    .environmentObject(store)
                    .navigationTitle("Parties")
            }
            .tabItem { Label("Parties", systemImage: "party.popper") }
        }
        .task { await store.loadIfNeeded() }
    }
}

struct DishesListView: View {
    @EnvironmentObject var store: DataStore
    @State private var query: String = ""

    var filtered: [EnrichedDish] {
        let base = store.dishes.sorted { $0.maxProfitPerDish > $1.maxProfitPerDish }
        guard !query.isEmpty else { return base }
        return base.filter { $0.name.localizedCaseInsensitiveContains(query) }
    }

    var body: some View {
        List(filtered) { dish in
            NavigationLink(value: dish.id) {
                VStack(alignment: .leading, spacing: 6) {
                    Text(dish.name).font(.headline)
                    HStack(spacing: 16) {
                        LabeledValue("Taste", value: "\(dish.final_taste)")
                        LabeledValue("Servings", value: "\(dish.servings)")
                        LabeledValue("Max Profit", value: currency(dish.maxProfitPerDish))
                    }
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                }
            }
        }
        .searchable(text: $query)
        .navigationDestination(for: Int.self) { dishId in
            if let dish = store.dishes.first(where: { $0.id == dishId }) {
                DishDetailView(dish: dish)
                    .environmentObject(store)
            }
        }
    }
}

struct DishDetailView: View {
    @EnvironmentObject var store: DataStore
    let dish: EnrichedDish

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text(dish.name).font(.largeTitle.bold())
                Grid(horizontalSpacing: 16, verticalSpacing: 12) {
                    GridRow {
                        LabeledValue("Final Level", value: "\(dish.final_level)")
                        LabeledValue("Final Taste", value: "\(dish.final_taste)")
                        LabeledValue("Final Price", value: currency(dish.final_price))
                    }
                    GridRow {
                        LabeledValue("Servings", value: "\(dish.servings)")
                        LabeledValue("Recipe Cost", value: currency(dish.recipeCost))
                        LabeledValue("Base Profit", value: currency(dish.baseProfit))
                    }
                    GridRow {
                        LabeledValue("Max Profit/Dish", value: currency(dish.maxProfitPerDish))
                        LabeledValue("Max Profit/Serving", value: currency(dish.maxProfitPerServing))
                        LabeledValue("Upgrade Cost", value: currency(dish.upgradeCost))
                    }
                }

                if let cond = dish.unlock_condition, !cond.isEmpty {
                    LabeledBlock(title: "Unlock Condition", text: cond)
                }

                VStack(alignment: .leading, spacing: 8) {
                    Text("Ingredients").font(.title3.bold())
                    ForEach(dish.ingredients) { line in
                        HStack {
                            if let ing = store.ingredients.first(where: { $0.id == line.ingredientId }) {
                                Text(ing.name)
                            } else {
                                Text("Ingredient #\(line.ingredientId)")
                            }
                            Spacer()
                            Text("x\(line.count)")
                        }
                        .padding(.vertical, 4)
                        .accessibilityElement(children: .combine)
                    }
                }

                if let bestId = dish.bestPartyDishId, let pd = store.partyDish(by: bestId) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Best Party").font(.title3.bold())
                        HStack {
                            if let party = store.parties.first(where: { $0.id == pd.partyId }) {
                                Text(party.name)
                            }
                            Spacer()
                            Text("Profit: \(currency(pd.profit))")
                        }
                    }
                }
            }
            .padding()
        }
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct IngredientsListView: View {
    @EnvironmentObject var store: DataStore
    @State private var query: String = ""

    var filtered: [EnrichedIngredient] {
        let base = store.ingredients
        guard !query.isEmpty else { return base }
        return base.filter { $0.name.localizedCaseInsensitiveContains(query) }
    }

    var body: some View {
        List(filtered) { ing in
            VStack(alignment: .leading, spacing: 4) {
                Text(ing.name).font(.headline)
                HStack(spacing: 16) {
                    if let source = ing.source { LabeledValue("Source", value: source) }
                    if let type = ing.type { LabeledValue("Type", value: type) }
                }
                .font(.subheadline)
                .foregroundStyle(.secondary)
            }
        }
        .searchable(text: $query)
    }
}

struct PartiesListView: View {
    @EnvironmentObject var store: DataStore

    var body: some View {
        List(store.parties.sorted { $0.order < $1.order }) { party in
            NavigationLink(value: party.id) {
                HStack {
                    Text(party.name).font(.headline)
                    Spacer()
                    Text("x\(party.bonus, specifier: "%.1f")")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .navigationDestination(for: Int.self) { partyId in
            if let party = store.parties.first(where: { $0.id == partyId }) {
                PartyDetailView(party: party)
                    .environmentObject(store)
            }
        }
    }
}

struct PartyDetailView: View {
    @EnvironmentObject var store: DataStore
    let party: EnrichedParty

    var dishes: [EnrichedDish] {
        let ids = Set(party.partyDishIds.compactMap { store.partyDish(by: $0)?.dishId })
        return store.dishes.filter { ids.contains($0.id) }
            .sorted { $0.maxProfitPerDish > $1.maxProfitPerDish }
    }

    var body: some View {
        List(dishes) { dish in
            NavigationLink(value: dish.id) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(dish.name).font(.headline)
                    HStack(spacing: 16) {
                        LabeledValue("Max Profit", value: currency(dish.maxProfitPerDish))
                        LabeledValue("Servings", value: "\(dish.servings)")
                    }
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                }
            }
        }
        .navigationDestination(for: Int.self) { id in
            if let dish = store.dishes.first(where: { $0.id == id }) {
                DishDetailView(dish: dish)
                    .environmentObject(store)
            }
        }
        .navigationTitle(party.name)
    }
}

// MARK: - UI Helpers

@inline(__always)
func currency(_ n: Double) -> String {
    let f = NumberFormatter()
    f.numberStyle = .currency
    f.currencyCode = "USD"
    return f.string(from: NSNumber(value: n)) ?? "$\(n)"
}

struct LabeledValue: View {
    let label: String
    let value: String
    init(_ label: String, value: String) { self.label = label; self.value = value }
    var body: some View {
        HStack(spacing: 6) {
            Text(label + ":")
                .foregroundStyle(.secondary)
            Text(value)
        }
    }
}

struct LabeledBlock: View {
    let title: String
    let text: String
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title).font(.headline)
            Text(text)
                .foregroundStyle(.secondary)
        }
    }
}

#Preview { ContentView() }
