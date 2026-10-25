package com.resumeai;

import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class ResumeAiApplicationTests {

    @MockBean
    private ChatModel chatModel;

    @Test
    void contextLoads() {
    }
}
