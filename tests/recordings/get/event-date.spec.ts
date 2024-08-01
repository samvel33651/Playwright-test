import { test, expect } from "@playwright/test";
import { sign } from "jsonwebtoken";
import {
  getDateDaysInFuture,
  getDateHoursBeforeNow,
} from "../../../utils/date";

test.describe("Recordings API event-date Tests ", () => {
  let jwtToken;
  const buildingId = process.env.BULDING_ID;
  const cameraId = process.env.CAMERA_ID;
  const queryDate = getDateHoursBeforeNow(24);

  test.beforeAll(async () => {
    const payload = {};

    const token = sign(payload, process.env.CLIENT_JWT_SECRET);

    jwtToken = token;
  });

  test("Should return status 200 and accurate data for valid camera and building IDs", async () => {
    const response = await fetch(
      `${process.env.API_URL}recordings/buildings/${buildingId}/cameras/${cameraId}/event-date?token=${jwtToken}&query=${queryDate}`
    );
    console.log("response", response.body, response.status);
    expect(response.status).toEqual(200);
  });

  test.describe("Bad requests tests for event-date endpoint", () => {
    test("should return status 400 when query parameter is missing", async () => {
      const url = `${process.env.API_URL}recordings/buildings/${buildingId}/cameras/${cameraId}/event-date?token=${jwtToken}`;

      const response = await fetch(url);

      expect(response.status).toEqual(400);
      expect(response.statusText).toEqual("Bad Request");
    });

    test("should return status 400 when query parameter is not a valid date string", async () => {
      const invalidDate = "invalidDate";
      const url = `${process.env.API_URL}recordings/buildings/${buildingId}/cameras/${cameraId}/event-date?token=${jwtToken}&query=${invalidDate}`;

      const response = await fetch(url);

      expect(response.status).toEqual(400);
      expect(response.statusText).toEqual("Bad Request");
    });

    test("should return status 400 when query is in the future", async () => {
      const dateInTheFurure = getDateDaysInFuture(1);
      const url = `${process.env.API_URL}recordings/buildings/${buildingId}/cameras/${cameraId}/event-date?token=${jwtToken}&query=${dateInTheFurure}`;
      console.log("url", url);
      const response = await fetch(url);

      expect(response.status).toEqual(400);
      expect(response.statusText).toEqual("Bad Request");
    });

    test("should return status 400 when query is not formatted correctly as yyyy-MM-dd--HH-mm-ss", async () => {
      const incorrectlyFormattedDate = getDateHoursBeforeNow(
        24,
        "yyyy-MM-dd--HH:mm:ss"
      );
      const url = `${process.env.API_URL}recordings/buildings/${buildingId}/cameras/${cameraId}/event-date?token=${jwtToken}&query=${incorrectlyFormattedDate}`;
      console.log("url", url);
      const response = await fetch(url);

      expect(response.status).toEqual(400);
      expect(response.statusText).toEqual("Bad Request");
    });
  });

  test.describe("Unauthorized access tests for event-date endpoint", () => {
    test("Should return status 401 when JWT secret is missing or incorrect", async () => {
      const payload = {
        cameraId: "test-camera-1",
        buildingId: "test-Building-id",
      };

      const token = sign(payload, "not_valid_secret");

      const url = `${process.env.API_URL}recordings/buildings/${buildingId}/cameras/${cameraId}/event-date?token=${token}&query=${queryDate}`;
      console.log("url", url);
      const response = await fetch(url);
      expect(response.status).toEqual(401);
    });

    test("Should return status 401 when JWT token is corrupted", async () => {
      const authToken = jwtToken.substring(0, jwtToken.length - 2);
      const url = `${process.env.API_URL}recordings/buildings/${buildingId}/cameras/${cameraId}/event-date?token=${authToken}&query=${queryDate}`;
      console.log("url", url);
      const response = await fetch(url);
      expect(response.status).toEqual(401);
    });

    test("Should return status 401 when JWT token is missing", async () => {
      const url = `${process.env.API_URL}recordings/buildings/${buildingId}/cameras/${cameraId}/event-date?query=${queryDate}`;

      const response = await fetch(url);
      expect(response.status).toEqual(401);
      expect(response.statusText).toEqual("Unauthorized");
    });

    test("Should return status 401 when getway secret  is provided instead  of client", async () => {
      const token = sign({}, process.env.GETWAY_JWT_SECRET);
      const url = `${process.env.API_URL}recordings/buildings/${buildingId}/cameras/${cameraId}/event-date?token=${token}&query=${queryDate}`;
      console.log("url", url);
      const response = await fetch(url);
      const resp = await response.json();
      expect(resp.error).toBe("Permission denied");
      expect(response.status).toEqual(401);
    });
  });

  test.describe("Not found tests for event-date endpoint", () => {
    test("Should return status 404 when building ID is incorrect", async () => {
      const incorrectBuildingId = "wrong-building-id";
      const response = await fetch(
        `${process.env.API_URL}recordings/buildings/${incorrectBuildingId}/cameras/${cameraId}/event-date?token=${jwtToken}&query=${queryDate}`
      );
      expect(response.status).toEqual(404);
    });

    test("Should return status 404 when camera ID is incorrect", async () => {
      const incorrectCamId = "wrong-cam-id";
      const response = await fetch(
        `${process.env.API_URL}recordings/buildings/${buildingId}/cameras/${incorrectCamId}/event-date?token=${jwtToken}&query=${queryDate}`
      );
      expect(response.status).toEqual(404);
    });

    test("Should return status 404 when both building ID and camera ID are incorrect", async () => {
      const incorrectCamId = "wrong-cam-id";
      const incorrectBuildingId = "wrong-building-id";
      const response = await fetch(
        `${process.env.API_URL}recordings/buildings/${incorrectBuildingId}/cameras/${incorrectCamId}/event-date?token=${jwtToken}&query=${queryDate}`
      );
      expect(response.status).toEqual(404);
    });

    test("Should return status 404 when building ID format is incorrect", async () => {
      const bId: number = 125;
      const payload = {
        buildingId: bId,
        cameraId: cameraId,
      };

      const token = sign(payload, process.env.CLIENT_JWT_SECRET);
      const response = await fetch(
        `${process.env.API_URL}recordings/buildings/${bId}/cameras/${cameraId}/event-date?token=${token}&query=${queryDate}`
      );
      expect(response.status).toEqual(404);
    });

    test("Should return status 404 when camera ID format is incorrect", async () => {
      const cId: number = 125;
      const payload = {
        buildingId: buildingId,
        cameraId: cId,
      };

      const token = sign(payload, process.env.CLIENT_JWT_SECRET);
      const response = await fetch(
        `${process.env.API_URL}recordings/buildings/${buildingId}/cameras/${cId}/event-date?token=${token}&query=${queryDate}`
      );
      expect(response.status).toEqual(404);
    });

    test("Should return status 404 when building ID is null or undefined", async () => {
      const bId: undefined | null = null;
      const payload = {
        buildingId: bId,
        cameraId: cameraId,
      };

      const token = sign(payload, process.env.CLIENT_JWT_SECRET);
      const response = await fetch(
        `${process.env.API_URL}recordings/buildings/${bId}/cameras/${cameraId}/event-date?token=${token}&query=${queryDate}`
      );
      expect(response.status).toEqual(404);
    });

    test("Should return status 404 when camera ID is null or undefined", async () => {
      const cId: undefined | null = null;
      const payload = {
        buildingId: buildingId,
        cameraId: cId,
      };

      const token = sign(payload, process.env.CLIENT_JWT_SECRET);
      const response = await fetch(
        `${process.env.API_URL}recordings/buildings/${buildingId}/cameras/${cId}/event-date?token=${token}&query=${queryDate}`
      );
      expect(response.status).toEqual(404);
    });

    test("Should return status 404 when camera and building IDs are undefined", async () => {
      const cId: undefined | null = undefined;
      const bId: undefined | null = undefined;
      const payload = {
        buildingId: bId,
        cameraId: cId,
      };

      const token = sign(payload, process.env.CLIENT_JWT_SECRET);
      const response = await fetch(
        `${process.env.API_URL}recordings/buildings/${bId}/cameras/${cId}/event-date?token=${token}&query=${queryDate}`
      );
      expect(response.status).toEqual(404);
    });
  });
});
