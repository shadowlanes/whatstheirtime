import Foundation

struct Friend: Identifiable, Hashable {
    let id = UUID()
    var name: String
    var city: City
    var notes: String = ""
    
    var localTime: String {
        return TimeManager.getLocalTime(for: city.timezone)
    }
    
    var formattedLocation: String {
        return "\(city.getFlag(for: city.country)) \(city.name), \(city.country)"
    }
}

class FriendManager {
    static let shared = FriendManager()
    
    private let userDefaultsKey = "savedFriends"
    private init() {
        loadFriends()
    }
    
    private(set) var friends: [Friend] = []
    
    func addFriend(name: String, city: City, notes: String = "") {
        let newFriend = Friend(name: name, city: city, notes: notes)
        friends.append(newFriend)
        saveFriends()
    }
    
    func updateFriend(id: UUID, name: String, city: City, notes: String) {
        if let index = friends.firstIndex(where: { $0.id == id }) {
            friends[index] = Friend(id: id, name: name, city: city, notes: notes)
            saveFriends()
        }
    }
    
    func deleteFriend(at index: Int) {
        if index >= 0 && index < friends.count {
            friends.remove(at: index)
            saveFriends()
        }
    }
    
    func deleteFriend(with id: UUID) {
        friends.removeAll(where: { $0.id == id })
        saveFriends()
    }
    
    // MARK: - Persistence
    
    private func saveFriends() {
        // Simple persistence for now - would improve this with Codable in a real app
        // or Core Data for more complex requirements
        let encodedData = try? JSONEncoder().encode(friends)
        UserDefaults.standard.set(encodedData, forKey: userDefaultsKey)
    }
    
    private func loadFriends() {
        if let savedData = UserDefaults.standard.data(forKey: userDefaultsKey),
           let loadedFriends = try? JSONDecoder().decode([Friend].self, from: savedData) {
            self.friends = loadedFriends
        }
    }
}