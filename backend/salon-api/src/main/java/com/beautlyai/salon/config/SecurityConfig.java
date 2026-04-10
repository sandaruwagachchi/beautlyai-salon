package com.beautlyai.salon.config;

import com.beautlyai.salon.auth.JwtAuthenticationFilter;
import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtFilter)
        throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .httpBasic(AbstractHttpConfigurer::disable)
            .formLogin(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth ->
                auth
                    .requestMatchers("/api/v1/public/**", "/actuator/health", "/actuator/info", "/error")
                    .permitAll()
                    .requestMatchers("/api/v1/admin/**")
                    .hasRole("ADMIN")
                    .requestMatchers("/api/v1/owner/**")
                    .hasAnyRole("OWNER", "ADMIN")
                    .requestMatchers("/api/v1/staff/**")
                    .hasAnyRole("STAFF", "OWNER", "ADMIN")
                    .requestMatchers("/api/v1/customer/**")
                    .hasRole("CUSTOMER")
                    .anyRequest()
                    .authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public UserDetailsManager userDetailsService(PasswordEncoder passwordEncoder) {
        UserDetails admin = User
            .withUsername("admin")
            .password(passwordEncoder.encode("admin123"))
            .roles("ADMIN")
            .build();
        UserDetails owner = User
            .withUsername("owner")
            .password(passwordEncoder.encode("owner123"))
            .roles("OWNER")
            .build();
        UserDetails staff = User
            .withUsername("staff")
            .password(passwordEncoder.encode("staff123"))
            .roles("STAFF")
            .build();
        UserDetails customer = User
            .withUsername("customer")
            .password(passwordEncoder.encode("customer123"))
            .roles("CUSTOMER")
            .build();
        return new InMemoryUserDetailsManager(admin, owner, staff, customer);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(
        @Value("${app.security.allowed-origins:http://localhost:8081}") String allowedOrigins
    ) {
        CorsConfiguration config = new CorsConfiguration();
        List<String> origins = Arrays.stream(allowedOrigins.split(",")).map(String::trim).toList();
        config.setAllowedOrigins(origins);
        config.setAllowedOriginPatterns(List.of(
            "http://localhost:*",
            "http://127.0.0.1:*",
            "http://192.168.*:*",
            "http://10.*:*",
            "http://172.*:*",
            "exp://*"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}

