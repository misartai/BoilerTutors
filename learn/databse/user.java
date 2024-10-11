import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
class User {

    /* This defines the User class, which has two main children, staff and students. These children classes extend this class */
    private String firstName;
    private String lastName;
    @Id
    private String purdueEmail;
    private String profilePictureDIR;
    private String password;
    private boolean eventNotif;
    private boolean generalNotifs;

    public User() {
        this.firstName = firstName;
        this.lastName = lastName;
        this.purdueEmail = purdueEmail;
        this.profilePictureDIR = profilePictureDIR;
        this.password = password;
        this.eventNotif = eventNotif;
        this.generalNotifs = generalNotifs;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getProfilePictureDIR() {
        return profilePictureDIR;
    }

    public String getPassword() {
        return password;
    }

    public boolean getEventNotifs() {
        return eventNotif;
    }

    public boolean getGeneralNotifs() {
        return generalNotifs;
    }
}
