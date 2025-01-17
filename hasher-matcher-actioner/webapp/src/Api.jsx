/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved
 */

import {Auth, API} from 'aws-amplify';
import {encode} from 'base64-arraybuffer';

async function getAuthorizationToken() {
  const currentSession = await Auth.currentSession();
  const accessToken = currentSession.getAccessToken();
  const jwtToken = accessToken.getJwtToken();
  return jwtToken;
}

async function apiGet(route, params = {}, responseType = null) {
  return API.get('hma_api', route, {
    responseType,
    headers: {
      Authorization: await getAuthorizationToken(),
    },
    queryStringParameters: params,
  });
}

async function apiPost(route, body, params = {}) {
  return API.post('hma_api', route, {
    body,
    headers: {
      Authorization: await getAuthorizationToken(),
    },
    queryStringParameters: params,
  });
}

export function fetchAllMatches() {
  return apiGet('/matches/');
}

export function fetchMatchesFromSignal(signalSource, signalId) {
  return apiGet('/matches/', {
    signal_q: signalId,
    signal_source: signalSource,
  });
}

export function fetchMatchesFromContent(contentId) {
  return apiGet('/matches/', {content_q: contentId});
}

export function fetchMatchDetails(key) {
  return apiGet(`/matches/match/${key}/`);
}

export function fetchHash(key) {
  return apiGet(`/hash/${key}`);
}

export function fetchImage(key) {
  return apiGet(`/image/${key}`, {}, 'blob');
}

export function fetchSignalSummary() {
  return apiGet('/signals');
}

export function fetchDashboardCardSummary(path) {
  return apiGet(`/${path}`);
}

export async function uploadImage(file) {
  const fileReader = new FileReader();
  fileReader.onload = () => {
    const fileContentsBase64Encoded = encode(fileReader.result);
    return apiPost('/upload', {
      fileName: file.name,
      fileContentsBase64Encoded,
    });
  };
  fileReader.readAsArrayBuffer(file);
}

export async function requestSignalOpinionChange(
  signalId,
  signalSource,
  dataset,
  opinionChange,
) {
  apiPost(
    '/matches/request-signal-opinion-change/',
    {},
    {
      signal_q: signalId,
      signal_source: signalSource,
      dataset_q: dataset,
      opinion_change: opinionChange,
    },
  );
}

export async function submitContent(
  submissionType,
  contentId,
  contentType,
  contentRef,
  metadata,
) {
  return apiPost('/submit/', {
    submission_type: submissionType,
    content_id: contentId,
    content_type: contentType,
    content_ref: contentRef,
    metadata,
  });
}

export async function submitContentUpload(
  submissionType,
  contentId,
  contentType,
  contentRef,
  metadata,
) {
  const fileReader = new FileReader();
  fileReader.onload = () => {
    const fileContentsBase64Encoded = encode(fileReader.result);
    apiPost('/submit/', {
      submission_type: submissionType,
      content_id: contentId,
      content_type: contentType,
      content_ref: fileContentsBase64Encoded,
      metadata,
    });
  };
  return fileReader.readAsArrayBuffer(contentRef);
}
