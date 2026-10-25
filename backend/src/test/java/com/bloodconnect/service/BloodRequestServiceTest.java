package com.bloodconnect.service;

import com.bloodconnect.dto.BloodRequestCreateRequest;
import com.bloodconnect.dto.BloodRequestResponse;
import com.bloodconnect.dto.DonorMatchResponse;
import com.bloodconnect.entity.AppUser;
import com.bloodconnect.entity.BloodRequest;
import com.bloodconnect.entity.RequestStatus;
import com.bloodconnect.repository.BloodRequestRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class BloodRequestServiceTest {

    @Test
    void createNormalizesUrgencyAndStartsRequestOpen() {
        BloodRequestRepository repository = mock(BloodRequestRepository.class);
        when(repository.save(any(BloodRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));
        BloodRequestCreateRequest request = new BloodRequestCreateRequest("Patient", "A+", 2,
                "City Hospital", "City", 12.0, 77.0, "urgent", "555-0100", "Need donors");

        BloodRequestResponse response = new BloodRequestService(repository, mock(MatchingService.class))
                .create(mock(AppUser.class), request);

        assertThat(response.urgency()).isEqualTo("URGENT");
        assertThat(response.status()).isEqualTo(RequestStatus.OPEN);
        verify(repository).save(any(BloodRequest.class));
    }

    @Test
    void matchesDelegatesOnlyForOpenOwnedRequest() {
        UUID requestId = UUID.randomUUID();
        UUID requesterId = UUID.randomUUID();
        BloodRequest request = request();
        List<DonorMatchResponse> expected = List.of();
        BloodRequestRepository repository = mock(BloodRequestRepository.class);
        MatchingService matchingService = mock(MatchingService.class);
        when(repository.findByIdAndRequesterId(requestId, requesterId)).thenReturn(Optional.of(request));
        when(matchingService.match(request)).thenReturn(expected);

        List<DonorMatchResponse> actual = new BloodRequestService(repository, matchingService)
                .matches(requestId, requesterId);

        assertThat(actual).isSameAs(expected);
        verify(matchingService).match(request);
    }

    @Test
    void matchesReturnsEmptyForClosedRequest() {
        UUID requestId = UUID.randomUUID();
        UUID requesterId = UUID.randomUUID();
        BloodRequest request = request();
        request.setStatus(RequestStatus.FULFILLED);
        BloodRequestRepository repository = mock(BloodRequestRepository.class);
        MatchingService matchingService = mock(MatchingService.class);
        when(repository.findByIdAndRequesterId(requestId, requesterId)).thenReturn(Optional.of(request));

        List<DonorMatchResponse> matches = new BloodRequestService(repository, matchingService)
                .matches(requestId, requesterId);

        assertThat(matches).isEmpty();
        verifyNoInteractions(matchingService);
    }

    @Test
    void getRejectsRequestNotOwnedByRequester() {
        UUID requestId = UUID.randomUUID();
        UUID requesterId = UUID.randomUUID();
        BloodRequestRepository repository = mock(BloodRequestRepository.class);
        when(repository.findByIdAndRequesterId(requestId, requesterId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> new BloodRequestService(repository, mock(MatchingService.class))
                .get(requestId, requesterId))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(error -> ((ResponseStatusException) error).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void updateStatusChangesOwnedRequestStatus() {
        UUID requestId = UUID.randomUUID();
        UUID requesterId = UUID.randomUUID();
        BloodRequest request = request();
        BloodRequestRepository repository = mock(BloodRequestRepository.class);
        when(repository.findByIdAndRequesterId(requestId, requesterId)).thenReturn(Optional.of(request));

        BloodRequestResponse response = new BloodRequestService(repository, mock(MatchingService.class))
                .updateStatus(requestId, requesterId, RequestStatus.CANCELLED);

        assertThat(response.status()).isEqualTo(RequestStatus.CANCELLED);
        assertThat(request.getStatus()).isEqualTo(RequestStatus.CANCELLED);
        verify(repository).findByIdAndRequesterId(requestId, requesterId);
    }

    @Test
    void updateStatusRejectsRequestNotOwnedByRequester() {
        UUID requestId = UUID.randomUUID();
        UUID requesterId = UUID.randomUUID();
        BloodRequestRepository repository = mock(BloodRequestRepository.class);
        when(repository.findByIdAndRequesterId(requestId, requesterId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> new BloodRequestService(repository, mock(MatchingService.class))
                .updateStatus(requestId, requesterId, RequestStatus.FULFILLED))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(error -> ((ResponseStatusException) error).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    private BloodRequest request() {
        return new BloodRequest(null, "Patient", "A+", 2, "City Hospital", "City",
                12.0, 77.0, "URGENT", "555-0100", "Need donors");
    }
}
