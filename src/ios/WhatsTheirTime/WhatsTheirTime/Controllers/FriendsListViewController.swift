import UIKit

class FriendsListViewController: UIViewController {
    
    private let tableView = UITableView()
    private let friendManager = FriendManager.shared
    private var timer: Timer?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        setupNotifications()
        startTimeUpdateTimer()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        tableView.reloadData()
    }
    
    private func setupUI() {
        view.backgroundColor = .systemBackground
        title = "What's Their Time"
        
        // Add button to add new friends
        navigationItem.rightBarButtonItem = UIBarButtonItem(
            barButtonSystemItem: .add,
            target: self,
            action: #selector(addFriendTapped)
        )
        
        // Configure table view
        tableView.delegate = self
        tableView.dataSource = self
        tableView.register(FriendTableViewCell.self, forCellReuseIdentifier: "FriendCell")
        tableView.translatesAutoresizingMaskIntoConstraints = false
        
        view.addSubview(tableView)
        
        NSLayoutConstraint.activate([
            tableView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            tableView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            tableView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            tableView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
    }
    
    private func setupNotifications() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(refreshTimeData),
            name: .refreshTimeData,
            object: nil
        )
    }
    
    private func startTimeUpdateTimer() {
        // Update the time display every minute
        timer = Timer.scheduledTimer(
            timeInterval: 60.0,
            target: self,
            selector: #selector(refreshTimeData),
            userInfo: nil,
            repeats: true
        )
    }
    
    @objc private func refreshTimeData() {
        tableView.reloadData()
    }
    
    @objc private func addFriendTapped() {
        let citySearchVC = CitySearchViewController { [weak self] selectedCity in
            guard let strongSelf = self else { return }
            
            // Create an alert to get the friend's name
            let alert = UIAlertController(
                title: "Add Friend",
                message: "Enter your friend's name",
                preferredStyle: .alert
            )
            
            alert.addTextField { textField in
                textField.placeholder = "Name"
            }
            
            let saveAction = UIAlertAction(title: "Save", style: .default) { [weak alert, weak self] _ in
                guard let textField = alert?.textFields?.first, let name = textField.text, !name.isEmpty else {
                    return
                }
                
                self?.friendManager.addFriend(name: name, city: selectedCity)
                self?.tableView.reloadData()
            }
            
            let cancelAction = UIAlertAction(title: "Cancel", style: .cancel)
            
            alert.addAction(saveAction)
            alert.addAction(cancelAction)
            
            strongSelf.present(alert, animated: true)
        }
        
        navigationController?.pushViewController(citySearchVC, animated: true)
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
        timer?.invalidate()
    }
}

// MARK: - UITableViewDelegate, UITableViewDataSource
extension FriendsListViewController: UITableViewDelegate, UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return friendManager.friends.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        guard let cell = tableView.dequeueReusableCell(withIdentifier: "FriendCell", for: indexPath) as? FriendTableViewCell else {
            return UITableViewCell()
        }
        
        let friend = friendManager.friends[indexPath.row]
        cell.configure(with: friend)
        
        return cell
    }
    
    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        return 80
    }
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        
        let friend = friendManager.friends[indexPath.row]
        let detailVC = FriendDetailViewController(friend: friend)
        navigationController?.pushViewController(detailVC, animated: true)
    }
    
    func tableView(_ tableView: UITableView, commit editingStyle: UITableViewCell.EditingStyle, forRowAt indexPath: IndexPath) {
        if editingStyle == .delete {
            friendManager.deleteFriend(at: indexPath.row)
            tableView.deleteRows(at: [indexPath], with: .automatic)
        }
    }
}