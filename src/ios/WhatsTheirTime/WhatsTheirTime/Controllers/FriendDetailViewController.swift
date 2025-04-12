import UIKit

class FriendDetailViewController: UIViewController {
    
    private let friend: Friend
    private let friendManager = FriendManager.shared
    private var timer: Timer?
    
    // UI Elements
    private let nameLabel = UILabel()
    private let locationLabel = UILabel()
    private let timeLabel = UILabel()
    private let dayLabel = UILabel()
    private let timeDifferenceLabel = UILabel()
    private let notesTextView = UITextView()
    private let editButton = UIButton(type: .system)
    
    init(friend: Friend) {
        self.friend = friend
        super.init(nibName: nil, bundle: nil)
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        startTimeUpdateTimer()
        updateUI()
    }
    
    private func setupUI() {
        title = friend.name
        view.backgroundColor = .systemBackground
        
        // Configure UI elements
        nameLabel.font = UIFont.boldSystemFont(ofSize: 24)
        nameLabel.translatesAutoresizingMaskIntoConstraints = false
        
        locationLabel.font = UIFont.systemFont(ofSize: 18)
        locationLabel.textColor = .secondaryLabel
        locationLabel.translatesAutoresizingMaskIntoConstraints = false
        
        timeLabel.font = UIFont.monospacedDigitSystemFont(ofSize: 48, weight: .bold)
        timeLabel.textAlignment = .center
        timeLabel.translatesAutoresizingMaskIntoConstraints = false
        
        dayLabel.font = UIFont.systemFont(ofSize: 18)
        dayLabel.textAlignment = .center
        dayLabel.translatesAutoresizingMaskIntoConstraints = false
        
        timeDifferenceLabel.font = UIFont.systemFont(ofSize: 16)
        timeDifferenceLabel.textAlignment = .center
        timeDifferenceLabel.textColor = .secondaryLabel
        timeDifferenceLabel.translatesAutoresizingMaskIntoConstraints = false
        
        notesTextView.font = UIFont.systemFont(ofSize: 16)
        notesTextView.isEditable = false
        notesTextView.backgroundColor = .secondarySystemBackground
        notesTextView.layer.cornerRadius = 8
        notesTextView.translatesAutoresizingMaskIntoConstraints = false
        
        editButton.setTitle("Edit", for: .normal)
        editButton.addTarget(self, action: #selector(editButtonTapped), for: .touchUpInside)
        editButton.translatesAutoresizingMaskIntoConstraints = false
        
        // Add to view hierarchy
        view.addSubview(nameLabel)
        view.addSubview(locationLabel)
        view.addSubview(timeLabel)
        view.addSubview(dayLabel)
        view.addSubview(timeDifferenceLabel)
        view.addSubview(notesTextView)
        view.addSubview(editButton)
        
        // Set up constraints
        NSLayoutConstraint.activate([
            nameLabel.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 20),
            nameLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            nameLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            
            locationLabel.topAnchor.constraint(equalTo: nameLabel.bottomAnchor, constant: 8),
            locationLabel.leadingAnchor.constraint(equalTo: nameLabel.leadingAnchor),
            locationLabel.trailingAnchor.constraint(equalTo: nameLabel.trailingAnchor),
            
            timeLabel.topAnchor.constraint(equalTo: locationLabel.bottomAnchor, constant: 40),
            timeLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            
            dayLabel.topAnchor.constraint(equalTo: timeLabel.bottomAnchor, constant: 4),
            dayLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            
            timeDifferenceLabel.topAnchor.constraint(equalTo: dayLabel.bottomAnchor, constant: 8),
            timeDifferenceLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            
            notesTextView.topAnchor.constraint(equalTo: timeDifferenceLabel.bottomAnchor, constant: 40),
            notesTextView.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            notesTextView.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            notesTextView.heightAnchor.constraint(equalToConstant: 120),
            
            editButton.topAnchor.constraint(equalTo: notesTextView.bottomAnchor, constant: 20),
            editButton.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            editButton.bottomAnchor.constraint(lessThanOrEqualTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -20)
        ])
    }
    
    private func startTimeUpdateTimer() {
        // Update the time display every minute
        timer = Timer.scheduledTimer(
            timeInterval: 60.0,
            target: self,
            selector: #selector(updateUI),
            userInfo: nil,
            repeats: true
        )
    }
    
    @objc private func updateUI() {
        nameLabel.text = friend.name
        locationLabel.text = friend.formattedLocation
        timeLabel.text = TimeManager.getLocalTime(for: friend.city.timezone)
        dayLabel.text = TimeManager.getLocalDay(for: friend.city.timezone)
        
        let timeDifference = TimeManager.getFormattedTimeDifference(for: friend.city.timezone)
        timeDifferenceLabel.text = timeDifference
        
        // Highlight if it's a different day
        let dayDifference = TimeManager.getDayDifference(for: friend.city.timezone)
        if dayDifference != 0 {
            let day = dayDifference > 0 ? "tomorrow" : "yesterday"
            timeDifferenceLabel.text = "\(timeDifference) (\(day))"
        }
        
        notesTextView.text = friend.notes.isEmpty ? "No notes" : friend.notes
    }
    
    @objc private func editButtonTapped() {
        let alertController = UIAlertController(title: "Edit Friend", message: nil, preferredStyle: .alert)
        
        alertController.addTextField { textField in
            textField.placeholder = "Name"
            textField.text = self.friend.name
        }
        
        alertController.addTextField { textField in
            textField.placeholder = "Notes"
            textField.text = self.friend.notes
        }
        
        let cancelAction = UIAlertAction(title: "Cancel", style: .cancel)
        
        let changeLocationAction = UIAlertAction(title: "Change Location", style: .default) { [weak self] _ in
            guard let self = self,
                  let nameTextField = alertController.textFields?.first,
                  let notesTextField = alertController.textFields?.last,
                  let name = nameTextField.text, !name.isEmpty else {
                return
            }
            
            let notes = notesTextField.text ?? ""
            
            let citySearchVC = CitySearchViewController { [weak self] selectedCity in
                guard let self = self else { return }
                
                self.friendManager.updateFriend(
                    id: self.friend.id,
                    name: name,
                    city: selectedCity,
                    notes: notes
                )
                
                // Go back to the friend list
                self.navigationController?.popViewController(animated: true)
            }
            
            self.navigationController?.pushViewController(citySearchVC, animated: true)
        }
        
        let saveAction = UIAlertAction(title: "Save", style: .default) { [weak self] _ in
            guard let self = self,
                  let nameTextField = alertController.textFields?.first,
                  let notesTextField = alertController.textFields?.last,
                  let name = nameTextField.text, !name.isEmpty else {
                return
            }
            
            let notes = notesTextField.text ?? ""
            
            self.friendManager.updateFriend(
                id: self.friend.id,
                name: name,
                city: self.friend.city,
                notes: notes
            )
            
            // Reload view with updated friend data
            if let updatedFriend = self.friendManager.friends.first(where: { $0.id == self.friend.id }) {
                let updatedVC = FriendDetailViewController(friend: updatedFriend)
                self.navigationController?.replaceLastViewController(with: updatedVC)
            }
        }
        
        alertController.addAction(cancelAction)
        alertController.addAction(changeLocationAction)
        alertController.addAction(saveAction)
        
        present(alertController, animated: true)
    }
    
    deinit {
        timer?.invalidate()
    }
}

// Helper extension for replacing view controllers
extension UINavigationController {
    func replaceLastViewController(with viewController: UIViewController) {
        var viewControllers = self.viewControllers
        viewControllers.removeLast()
        viewControllers.append(viewController)
        setViewControllers(viewControllers, animated: false)
    }
}