import UserNotifications
class NotificationService: UNNotificationServiceExtension {
    var contentHandler: ((UNNotificationContent) -> Void)?
    var bestAttemptContent: UNMutableNotificationContent?
    override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
        self.contentHandler = contentHandler
        bestAttemptContent = (request.content.mutableCopy() as? UNMutableNotificationContent)
        if let bestAttemptContent = bestAttemptContent {
            // Modify the notification content here...
            print("[NotificationService] Received notification request")
            
            // 1. Check for image in payload (fcm_options.image or custom data)
            // Firebase sends image in fcm_options.image
            let userInfo = request.content.userInfo
            print("[NotificationService] UserInfo: \(userInfo)")
            
            var imageUrlString: String?
            
            // Check for 'fcm_options' -> 'image'
            if let fcmOptions = userInfo["fcm_options"] as? [String: Any],
               let image = fcmOptions["image"] as? String {
                imageUrlString = image
                print("[NotificationService] Found image in fcm_options: \(image)")
            }
            
            // Fallback: Check for 'image' in data/userInfo directly
            if imageUrlString == nil, let image = userInfo["image"] as? String {
                imageUrlString = image
                print("[NotificationService] Found image in userInfo: \(image)")
            }

            if let imageUrlString = imageUrlString, let url = URL(string: imageUrlString) {
                // Download the image
                print("[NotificationService] Downloading image from: \(url)")
                downloadImage(from: url) { attachment in
                    if let attachment = attachment {
                        print("[NotificationService] Attachment created successfully")
                        bestAttemptContent.attachments = [attachment]
                    } else {
                        print("[NotificationService] Failed to create attachment")
                    }
                    contentHandler(bestAttemptContent)
                }
            } else {
                print("[NotificationService] No image URL found")
                contentHandler(bestAttemptContent)
            }
        }
    }
    
    private func downloadImage(from url: URL, completion: @escaping (UNNotificationAttachment?) -> Void) {
        let task = URLSession.shared.downloadTask(with: url) { (location, response, error) in
            guard let location = location else {
                completion(nil)
                return
            }
            
            // Move temporary file to a place with .jpg/.png extension so iOS recognizes it
            let tmpDirectory = NSTemporaryDirectory()
            let temporaryFile = URL(fileURLWithPath: tmpDirectory).appendingPathComponent(url.lastPathComponent)
            
            do {
                if FileManager.default.fileExists(atPath: temporaryFile.path) {
                    try FileManager.default.removeItem(at: temporaryFile)
                }
                try FileManager.default.moveItem(at: location, to: temporaryFile)
                
                let attachment = try UNNotificationAttachment(identifier: "", url: temporaryFile, options: nil)
                completion(attachment)
            } catch {
                print("Error creating attachment: \(error)")
                completion(nil)
            }
        }
        task.resume()
    }
    override func serviceExtensionTimeWillExpire() {
        if let contentHandler = contentHandler, let bestAttemptContent = bestAttemptContent {
            contentHandler(bestAttemptContent)
        }
    }
}
