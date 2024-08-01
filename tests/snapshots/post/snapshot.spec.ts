import { test, expect } from "@playwright/test";
import { sign } from "jsonwebtoken";
import * as fs from "fs";
import {
  getDateDaysInFuture,
  getDateHoursBeforeNow,
} from "../../../utils/date";

test.describe("Snapshots API [POST] snapshot Tests ", () => {
  let jwtToken;
  const buildingId = process.env.BULDING_ID;
  const cameraId = process.env.CAMERA_ID;
  let fileName: string;
  let bigFileName: string;
  let filePath: string;

  test.beforeAll(async () => {
    const payload = {
      buildingId: buildingId,
      cameraId: cameraId,
    };

    const token = sign(payload, process.env.GETWAY_JWT_SECRET);
    console.log("token", token);
    console.log("buildingId", buildingId);
    console.log("cameraId", cameraId);
    jwtToken = token;
    fileName = getDateHoursBeforeNow(48);
    filePath = "assets/img_test_file_small_100k.png";
    bigFileName = getDateHoursBeforeNow(47);
  });

  test.describe("Successful tests for [POST] Files endpoint", () => {
    test("should successfully upload a small file (100KB)", async () => {
      const url = `${process.env.API_URL}snapshots`;
      const data = fs.readFileSync(filePath, "utf8");
      const blob = new Blob([data], { type: "image/png" });
      const formData = new FormData();
      formData.append("file", blob, `${fileName}.png`);
      formData.append("token", jwtToken);
      console.log("fileName", fileName, buildingId, cameraId);
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      expect(response.status).toEqual(200);
    });
    test("should successfully upload a file with size of 500KB", async () => {
      const url = `${process.env.API_URL}snapshots`;
      const bigFilePath = "assets/img_test_file_500KB.png";
      const data = fs.readFileSync(bigFilePath, "utf8");

      const blob = new Blob([data], { type: "image/png" });
      const formData = new FormData();
      formData.append("file", blob, `${bigFileName}.png`);
      formData.append("token", jwtToken);

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      expect(response.status).toEqual(200);
    });
  });

  test.describe("Request  entity to larg tests for [POST] snapshots endpoint", () => {
    test("should return 413 for file with  size of 1MB", async () => {
      const url = `${process.env.API_URL}snapshots`;
      const bigFilePath = "assets/img_test_file_medium_1MB.png";
      const data = fs.readFileSync(bigFilePath, "utf8");

      const blob = new Blob([data], { type: "image/png" });
      const formData = new FormData();
      formData.append("file", blob, `${bigFileName}.png`);
      formData.append("token", jwtToken);

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      expect(response.status).toEqual(413);
    });
    test("should return 413 for file with  size of 5MB", async () => {
      const url = `${process.env.API_URL}snapshots`;
      const bigFilePath = "assets/img_test_file_big_5MB.png";
      const data = fs.readFileSync(bigFilePath, "utf8");

      const blob = new Blob([data], { type: "image/png" });
      const formData = new FormData();
      formData.append("file", blob, `${bigFileName}.png`);
      formData.append("token", jwtToken);

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      expect(response.status).toEqual(413);
    });
  });

  test.describe("Bad requests tests for [POST] snapshots endpoint", () => {
    test.skip("should return 400 when file extension is gif", async () => {
      const url = `${process.env.API_URL}snapshots`;
      const bigFilePath = "assets/img_test_file_small_gif.gif";

      const data = fs.readFileSync(bigFilePath, "utf8");
      const blob = new Blob([data], { type: "image/png" });

      const formData = new FormData();
      formData.append("file", blob, `${bigFileName}.png`);
      formData.append("token", jwtToken);

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });
      console.log("eresponse", response.status, response);

      expect(response.status).toEqual(400);
    });
  });

  test.describe("Unauthorized access tests for [POST] snapshots endpoint", () => {
    test("should return 401 when token is missing in form data", async () => {
      const url = `${process.env.API_URL}snapshots`;
      const bigFilePath = "assets/img_test_file_500KB.png";
      const data = fs.readFileSync(bigFilePath, "utf8");

      const blob = new Blob([data], { type: "image/png" });
      const formData = new FormData();
      formData.append("file", blob, `${bigFileName}.png`);
      // formData.append("token", jwtToken);

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const resp = await response.json();
      console.log("json", resp);
      expect(resp.error).toEqual(`Missing token`);
      expect(response.status).toEqual(401);
    });

    test("should return 401 when token is null in form data", async () => {
      const url = `${process.env.API_URL}snapshots`;
      const bigFilePath = "assets/img_test_file_500KB.png";
      const data = fs.readFileSync(bigFilePath, "utf8");

      const blob = new Blob([data], { type: "image/png" });
      const formData = new FormData();
      formData.append("file", blob, `${bigFileName}.png`);
      formData.append("token", null);

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const resp = await response.json();
      console.log("json", resp);
      expect(resp.error).toEqual(`Invalid token`);
      expect(response.status).toEqual(401);
    });

    test("should return 401 when JWT token is corrupted", async () => {
      const url = `${process.env.API_URL}snapshots`;
      const bigFilePath = "assets/img_test_file_500KB.png";
      const data = fs.readFileSync(bigFilePath, "utf8");

      const blob = new Blob([data], { type: "image/png" });
      const formData = new FormData();
      formData.append("file", blob, `${bigFileName}.png`);
      const authToken = jwtToken.substring(0, jwtToken.length - 2);
      formData.append("token", authToken);

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const resp = await response.json();
      console.log("json", resp);
      expect(resp.error).toEqual(`Invalid token`);
      expect(response.status).toEqual(401);
    });

    test("should return 401 when cameraId and buildingId are missing in token payload", async () => {
      const payload = {};

      const token = sign(payload, process.env.GETWAY_JWT_SECRET);
      const url = `${process.env.API_URL}snapshots`;
      const bigFilePath = "assets/img_test_file_500KB.png";
      const data = fs.readFileSync(bigFilePath, "utf8");

      const blob = new Blob([data], { type: "image/png" });
      const formData = new FormData();
      formData.append("file", blob, `${bigFileName}.png`);

      formData.append("token", token);

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const resp = await response.json();
      console.log("json", resp);
      expect(resp.error).toEqual(`Missing cameraId or buildingId`);
      expect(response.status).toEqual(401);
    });

    test("should return 401 when cameraId is missing in token payload", async () => {
      const payload = { buildingId: buildingId };
      const token = sign(payload, process.env.GETWAY_JWT_SECRET);
      const url = `${process.env.API_URL}snapshots`;
      const bigFilePath = "assets/img_test_file_500KB.png";
      const data = fs.readFileSync(bigFilePath, "utf8");

      const blob = new Blob([data], { type: "image/png" });
      const formData = new FormData();
      formData.append("file", blob, `${bigFileName}.png`);

      formData.append("token", token);

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const resp = await response.json();
      console.log("json", resp);
      expect(resp.error).toEqual(`Missing cameraId or buildingId`);
      expect(response.status).toEqual(401);
    });

    test("Should return status 401 when buildingId is missing in token payload", async () => {
      const payload = { cameraId: cameraId };
      const token = sign(payload, process.env.GETWAY_JWT_SECRET);
      const url = `${process.env.API_URL}snapshots`;
      const bigFilePath = "assets/img_test_file_500KB.png";
      const data = fs.readFileSync(bigFilePath, "utf8");

      const blob = new Blob([data], { type: "image/png" });
      const formData = new FormData();
      formData.append("file", blob, `${bigFileName}.png`);

      formData.append("token", token);

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const resp = await response.json();
      console.log("json", resp);
      expect(resp.error).toEqual(`Missing cameraId or buildingId`);
      expect(response.status).toEqual(401);
    });

    //receiving 200 instead of 401
    // TODO check  this test  case after validation implementation for camera id is done
    test.skip("Should return status 401 when buildingId and cameraId are incorrect in token payload", async () => {
      const payload = {
        cameraId: "random-incorrect-camera-1",
        buildingId: "random.incorrect.building-1",
      };
      const token = sign(payload, process.env.GETWAY_JWT_SECRET);
      const url = `${process.env.API_URL}snapshots`;
      const bigFilePath = "assets/img_test_file_500KB.png";
      const data = fs.readFileSync(bigFilePath, "utf8");

      const blob = new Blob([data], { type: "image/png" });
      const formData = new FormData();
      formData.append("file", blob, `${bigFileName}.png`);

      formData.append("token", token);

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const resp = await response.json();
      console.log("json", resp);
      expect(resp.error).toEqual(`Missing cameraId or buildingId`);
      expect(response.status).toEqual(401);
    });

    //receiving 200 instead of 401
    // TODO check  this test  case after validation implementation for camera id is done
    test.skip("Should return status 401 when buildingId and cameraId types are incorrect in token payload", async () => {
      const payload = {
        cameraId: 142,
        buildingId: 142,
      };
      const token = sign(payload, process.env.GETWAY_JWT_SECRET);
      const url = `${process.env.API_URL}snapshots`;
      const bigFilePath = "assets/img_test_file_500KB.png";
      const data = fs.readFileSync(bigFilePath, "utf8");

      const blob = new Blob([data], { type: "image/png" });
      const formData = new FormData();
      formData.append("file", blob, `${bigFileName}.png`);

      formData.append("token", token);

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const resp = await response.json();
      console.log("json", resp);
      expect(resp.error).toEqual(`Missing cameraId or buildingId`);
      expect(response.status).toEqual(401);
    });

    test("Should return status 401 when JWT secret is missing or incorrect", async () => {
      const payload = {
        buildingId,
        cameraId,
      };
      const token = sign(payload, "invalidSecret");

      const url = `${process.env.API_URL}snapshots`;
      const bigFilePath = "assets/img_test_file_500KB.png";
      const data = fs.readFileSync(bigFilePath, "utf8");

      const blob = new Blob([data], { type: "image/png" });
      const formData = new FormData();
      formData.append("file", blob, `${bigFileName}.png`);

      formData.append("token", token);

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const resp = await response.json();
      console.log("json", resp);
      expect(resp.error).toEqual(`Invalid token`);
      expect(response.status).toEqual(401);
    });

    test("Should return status 401 when  client JWT secret is used", async () => {
      const payload = {
        buildingId,
        cameraId,
      };
      const token = sign(payload, process.env.CLIENT_JWT_SECRET);
      const url = `${process.env.API_URL}snapshots`;
      const bigFilePath = "assets/img_test_file_500KB.png";
      const data = fs.readFileSync(bigFilePath, "utf8");

      const blob = new Blob([data], { type: "image/png" });
      const formData = new FormData();
      formData.append("file", blob, `${bigFileName}.png`);

      formData.append("token", token);

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const resp = await response.json();
      console.log("json", resp);
      expect(resp.error).toEqual(`Invalid token`);
      expect(response.status).toEqual(401);
    });
  });
});
