@Service
public class RegistrationService {
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;

    public RegistrationService(UserRepository userRepository, JavaMailSender mailSender) {
        this.userRepository = userRepository;
        this.mailSender = mailSender;
    }

    public void registerUser(User user) {
        user.setPasswordHash(encodePassword(user.getPasswordHash())); // bcrypt, argon2
        userRepository.save(user);

        sendVerificationEmail(user);
    }

    private void sendVerificationEmail(User user) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Verify your email");
        message.setText("Click here to verify: https://your-app.com/verify?user=" + user.getId());
        mailSender.send(message);
    }

    private String encodePassword(String raw) {
        return new BCryptPasswordEncoder().encode(raw);
    }
}
