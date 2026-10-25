package com.resumeai.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {

    @Bean
    public ChatClient chatClient(ChatModel chatModel) {
        return ChatClient.builder(chatModel)
                .defaultSystem("You are an expert resume writer and career coach with 15 years of experience. " +
                        "You help professionals create ATS-friendly, compelling resumes that get interviews. " +
                        "Always be honest and do not fabricate information.")
                .build();
    }
}
