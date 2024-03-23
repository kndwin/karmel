const request = new Request(
  "https://fcm.googleapis.com/fcm/send/czC_RLM1et8:APA91bHOrIU7bofDx4NDaE790IpWtifMFEaoXBSEOilkcClq8UZ7rhWu4zt_FhiBz2fjam8nD_V0POHYjn3kabCc033ChjhA5oM1RNCi39ySyADFRqBM7qeQdPWGWjpP_elRq3CKkEux",
  {
    method: "POST",
    headers: {
      "Content-Type": "octet/stream",
      Authorization: `vapid t=eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJhdWQiOiJodHRwczovL2ZjbS5nb29nbGVhcGlzLmNvbSIsImV4cCI6MTcxMTEzOTA5Miwic3ViIjoibWFpbHRvOmV4YW1wbGVAcXEuY29tIn0.HuHS1saQ26EVTu75e0SLvwtYj16RSDKoSBx21Oblukuilh_s1IMwceAvmSVlyYB0Qka1Jxt3W6QcYJkq88E30A, k=BIWZcbfWo9sRdmUkeNP2WrdObJVRyqFd9G4XIMLYiriMaomkSSbsk3S8nbrfWHoHBAKhKp_XsG26hcDnGA48-VI`,
      "Content-Encoding": "aesgcm",
      ttl: "2419200",
    },
  }
);
const response = await fetch(request);

const status = response.status;
const body = await response.text();
console.log({ status, body });
