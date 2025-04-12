import UIKit

class FriendTableViewCell: UITableViewCell {
    
    private let nameLabel = UILabel()
    private let locationLabel = UILabel()
    private let timeLabel = UILabel()
    private let timeDifferenceLabel = UILabel()
    
    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        setupUI()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    private func setupUI() {
        // Configure labels
        nameLabel.font = UIFont.boldSystemFont(ofSize: 17)
        nameLabel.translatesAutoresizingMaskIntoConstraints = false
        
        locationLabel.font = UIFont.systemFont(ofSize: 14)
        locationLabel.textColor = .secondaryLabel
        locationLabel.translatesAutoresizingMaskIntoConstraints = false
        
        timeLabel.font = UIFont.monospacedDigitSystemFont(ofSize: 20, weight: .semibold)
        timeLabel.translatesAutoresizingMaskIntoConstraints = false
        
        timeDifferenceLabel.font = UIFont.systemFont(ofSize: 12)
        timeDifferenceLabel.textColor = .secondaryLabel
        timeDifferenceLabel.translatesAutoresizingMaskIntoConstraints = false
        
        // Add to view hierarchy
        contentView.addSubview(nameLabel)
        contentView.addSubview(locationLabel)
        contentView.addSubview(timeLabel)
        contentView.addSubview(timeDifferenceLabel)
        
        // Set up constraints
        NSLayoutConstraint.activate([
            nameLabel.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 10),
            nameLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            nameLabel.trailingAnchor.constraint(lessThanOrEqualTo: timeLabel.leadingAnchor, constant: -8),
            
            locationLabel.topAnchor.constraint(equalTo: nameLabel.bottomAnchor, constant: 4),
            locationLabel.leadingAnchor.constraint(equalTo: nameLabel.leadingAnchor),
            locationLabel.trailingAnchor.constraint(lessThanOrEqualTo: timeLabel.leadingAnchor, constant: -8),
            
            timeLabel.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 16),
            timeLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            
            timeDifferenceLabel.topAnchor.constraint(equalTo: timeLabel.bottomAnchor, constant: 4),
            timeDifferenceLabel.trailingAnchor.constraint(equalTo: timeLabel.trailingAnchor),
            timeDifferenceLabel.bottomAnchor.constraint(lessThanOrEqualTo: contentView.bottomAnchor, constant: -10)
        ])
        
        // Add disclosure indicator
        accessoryType = .disclosureIndicator
    }
    
    func configure(with friend: Friend) {
        nameLabel.text = friend.name
        locationLabel.text = friend.formattedLocation
        timeLabel.text = friend.localTime
        
        let timeDifference = TimeManager.getFormattedTimeDifference(for: friend.city.timezone)
        timeDifferenceLabel.text = timeDifference
        
        // Highlight if it's a different day
        let dayDifference = TimeManager.getDayDifference(for: friend.city.timezone)
        if dayDifference != 0 {
            let day = dayDifference > 0 ? "tomorrow" : "yesterday"
            timeDifferenceLabel.text = "\(timeDifference) (\(day))"
        }
    }
}