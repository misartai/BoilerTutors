import java.util*;
import com.mongodb*;
import org.bson*;

public class mongoDBaccess {
  public static void main(String[] args) {
      String server = "servername//localhost::2000"; //change with connection later, does not matter here because this is a mock up

      MongoClient mongoC = new MongoClient(new MongoClient(server));
      MongoDatabase mongoDB = new MongoDatabase(new MongoDatabase("testDB"));
      MongoCollection<Document> collection = database.getCollection("User");
      //now MongoDB tools can be used later

      //Essentially data hosting class to hold whatever elements are in the server or will be added to it
      Document user = new Document("name", "J. Doe");
           .append("classes", Arrays.asList("MA101", "BIOL201", "CS109"));
      collection.insertOne(user); //collection acts as 'user book'

      Document curStudent = collection.find().first();

      //can do error handling from here
      if (foundStudent != null) {
            System.out.println("Retrieved document: " + foundStudent.toJson());
      } else {
            System.out.println("No document found");
      } //super basic, if there is a user that was added, send to Json, if not, error
      //user SHOULD be found as it was added manually above.
    
      mongoC.close();
  }
}
