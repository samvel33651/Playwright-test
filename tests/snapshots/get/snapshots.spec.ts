import { test, expect } from "@playwright/test";
import { sign } from "jsonwebtoken";

test.describe("Recordings API Snapshots tests", () => {
  let jwtToken;
  const buildingId = process.env.BULDING_ID;
  const cameraId = process.env.CAMERA_ID;

  test.beforeAll(async () => {
    const payload = {};

    const token = sign(payload, process.env.CLIENT_JWT_SECRET);
    console.log("token", token);
    console.log("buildingId", buildingId);
    console.log("cameraId", cameraId);
    jwtToken = token;
  });

  test("Should return status 200 and accurate data for valid camera and building IDs", async () => {
    const response = await fetch(
      `${process.env.API_URL}snapshots/buildings/${buildingId}/cameras/${cameraId}?token=${jwtToken}`
    );
    console.log("response", response.body, response.status);
    expect(response.status).toEqual(200);
  });

  test.describe("Unauthorized access tests for snapshots endpoint", () => {
    test("Should return status 401 when JWT secret is missing or incorrect", async () => {
      const payload = {
        cameraId: "test-camera-1",
        buildingId: "test-Building-id",
      };

      const token = sign(payload, "not_valid_secret");

      const url = `${process.env.API_URL}snapshots/buildings/${buildingId}/cameras/${cameraId}?token=${token}`;
      console.log("url", url);
      const response = await fetch(url);
      expect(response.status).toEqual(401);
    });

    test("Should return status 401 when JWT token is corrupted", async () => {
      const authToken = jwtToken.substring(0, jwtToken.length - 2);
      const url = `${process.env.API_URL}snapshots/buildings/${buildingId}/cameras/${cameraId}?token=${authToken}`;
      console.log("url", url);
      const response = await fetch(url);
      expect(response.status).toEqual(401);
    });

    test("Should return status 401 when JWT token is missing", async () => {
      const url = `${process.env.API_URL}snapshots/buildings/${buildingId}/cameras/${cameraId}`;

      const response = await fetch(url);
      expect(response.status).toEqual(401);
      expect(response.statusText).toEqual("Unauthorized");
    });

    test("Should return status 401 when getway secret  is provided instead  of client", async () => {
      const token = sign({}, process.env.GETWAY_JWT_SECRET);
      const url = `${process.env.API_URL}snapshots/buildings/${buildingId}/cameras/${cameraId}?token=${token}`;
      console.log("url", url);
      const response = await fetch(url);
      const resp = await response.json();
      expect(resp.error).toBe("Permission denied");
      expect(response.status).toEqual(401);
    });
  });

  test.describe("Not found tests for snapshots endpoint", () => {
    test("Should return status 404 when building ID is incorrect", async () => {
      const incorrectBuildingId = "wrong-building-id";
      const response = await fetch(
        `${process.env.API_URL}snapshots/buildings/${incorrectBuildingId}/cameras/${cameraId}?token=${jwtToken}`
      );
      expect(response.status).toEqual(404);
    });

    test("Should return status 404 when camera ID is incorrect", async () => {
      const incorrectCamId = "wrong-cam-id";
      const response = await fetch(
        `${process.env.API_URL}snapshots/buildings/${buildingId}/cameras/${incorrectCamId}?token=${jwtToken}`
      );
      expect(response.status).toEqual(404);
    });
    test("Should return status 404 when both building ID and camera ID are incorrect", async () => {
      const incorrectCamId = "wrong-cam-id";
      const incorrectBuildingId = "wrong-building-id";
      const response = await fetch(
        `${process.env.API_URL}snapshots/buildings/${incorrectBuildingId}/cameras/${incorrectCamId}?token=${jwtToken}`
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
        `${process.env.API_URL}snapshots/buildings/${bId}/cameras/${cameraId}?token=${token}`
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
        `${process.env.API_URL}snapshots/buildings/${buildingId}/cameras/${cId}?token=${token}`
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
        `${process.env.API_URL}snapshots/buildings/${bId}/cameras/${cameraId}?token=${token}`
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
        `${process.env.API_URL}snapshots/buildings/${buildingId}/cameras/${cId}?token=${token}`
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
        `${process.env.API_URL}snapshots/buildings/${bId}/cameras/${cId}?token=${token}`
      );
      expect(response.status).toEqual(404);
    });
  });
});
