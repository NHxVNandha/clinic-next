using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace ClinicNext.Api.IntegrationTests;

public class SmokeFlowTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public SmokeFlowTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });
    }

    [Fact]
    public async Task Login_Returns_Access_And_Refresh_Token()
    {
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", new
        {
            email = "admin@test.local",
            password = "Password123!"
        });

        var raw = await response.Content.ReadAsStringAsync();
        Assert.True(response.StatusCode == HttpStatusCode.OK, $"Unexpected status {(int)response.StatusCode}. Body: {raw}");

        var json = JsonSerializer.Deserialize<JsonElement>(raw);
        var data = json.GetProperty("data");
        Assert.False(string.IsNullOrWhiteSpace(data.GetProperty("accessToken").GetString()));
        Assert.False(string.IsNullOrWhiteSpace(data.GetProperty("refreshToken").GetString()));
    }

    [Fact]
    public async Task Core_Protected_Endpoints_Return_Success_With_Bearer()
    {
        var me = await _client.GetAsync("/api/v1/auth/me");
        var pendaftaran = await _client.GetAsync("/api/v1/pendaftaran");
        var pelayanan = await _client.GetAsync("/api/v1/pelayanan");
        var kasir = await _client.GetAsync("/api/v1/kasir/pembayaran");
        var laporan = await _client.GetAsync("/api/v1/laporan/pendaftaran");

        Assert.Equal(HttpStatusCode.OK, me.StatusCode);
        Assert.Equal(HttpStatusCode.OK, pendaftaran.StatusCode);
        Assert.Equal(HttpStatusCode.OK, pelayanan.StatusCode);
        Assert.Equal(HttpStatusCode.OK, kasir.StatusCode);
        Assert.Equal(HttpStatusCode.OK, laporan.StatusCode);
    }

    [Fact]
    public async Task Pelayanan_And_Kasir_Basic_Flow_Works()
    {
        var createTindakan = await _client.PostAsJsonAsync("/api/v1/pelayanan/REG001/tindakan", new
        {
            items = new[]
            {
                new { idJasa = 1L, harga = 12000m, jumlah = 2 }
            }
        });
        Assert.Equal(HttpStatusCode.OK, createTindakan.StatusCode);

        var previewInvoice = await _client.GetAsync("/api/v1/kasir/invoice-preview/REG001");
        Assert.Equal(HttpStatusCode.OK, previewInvoice.StatusCode);
    }

    [Fact]
    public async Task Validation_Response_Uses_Standard_Error_Contract()
    {
        var response = await _client.PostAsJsonAsync("/api/v1/pendaftaran", new { });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.False(json.GetProperty("success").GetBoolean());
        Assert.Equal("Validasi gagal.", json.GetProperty("message").GetString());
        Assert.True(json.TryGetProperty("errors", out _));
    }

    [Fact]
    public async Task Auth_Sessions_Endpoints_Work()
    {
        var sessions = await _client.GetAsync("/api/v1/auth/sessions");
        Assert.Equal(HttpStatusCode.OK, sessions.StatusCode);

        var revoke = await _client.PostAsJsonAsync("/api/v1/auth/revoke-all", new { });
        Assert.Equal(HttpStatusCode.OK, revoke.StatusCode);
    }

}
