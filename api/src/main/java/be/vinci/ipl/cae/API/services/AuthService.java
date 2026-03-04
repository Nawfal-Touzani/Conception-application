package be.vinci.ipl.cae.API.services;

import be.vinci.ipl.cae.API.models.dtos.MemberRegisterRequestDTO;
import be.vinci.ipl.cae.API.models.entities.Image;
import be.vinci.ipl.cae.API.models.entities.Member;
import be.vinci.ipl.cae.API.models.entities.Speciality;
import be.vinci.ipl.cae.API.repositories.ImageRepository;
import be.vinci.ipl.cae.API.repositories.MemberRepository;
import be.vinci.ipl.cae.API.repositories.SpecialityRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Handles business logic for authentication (registration and login).
 */
@Service
public class AuthService {

    private final MemberRepository memberRepository;
    private final ImageRepository imageRepository;
    private final SpecialityRepository specialityRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(
            MemberRepository memberRepository,
            ImageRepository imageRepository,
            SpecialityRepository specialityRepository,
            BCryptPasswordEncoder passwordEncoder
    ) {
        this.memberRepository = memberRepository;
        this.imageRepository = imageRepository;
        this.specialityRepository = specialityRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Registers a new member.
     *
     * @param request the registration data sent from the frontend
     * @return the saved Member, or null if the email is already taken
     */
    public Member register(MemberRegisterRequestDTO request) {
        // 1. Check if email is already taken
        if (memberRepository.existsByEmail(request.getEmail())) {
            return null;
        }

        // 2. Fetch image and speciality from DB
        Image image = imageRepository.findById(request.getImageId()).orElse(null);
        Speciality speciality = specialityRepository.findById(request.getSpecialityId()).orElse(null);

        if (image == null || speciality == null) {
            return null;
        }

        // 3. Build the new member
        Member member = new Member();
        member.setEmail(request.getEmail());
        member.setPassword(passwordEncoder.encode(request.getPassword())); // BCrypt hash
        member.setTag(request.getTag());
        member.setAdmin(false);
        member.setImage(image);
        member.setSpeciality(speciality);

        // 4. Save and return
        return memberRepository.save(member);
    }
}

