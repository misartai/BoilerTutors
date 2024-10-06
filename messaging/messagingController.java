
public class MessageController {

    private messageService messageService;

    public List<Message> getMessagesForUser(String userID) {
        return messageService.getMessagesByUserID(userID);
    }

    public List<User> getContactsForUser(String userID) {
        return messageService.getContactsForUser(userID);
    }

    public String sendMessage(Message message) {
        messageService.sendMessage(message);
        return "Sent Successfully";
    }
}
