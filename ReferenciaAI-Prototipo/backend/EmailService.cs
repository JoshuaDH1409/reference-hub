using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

namespace ReferenciaAI.Api
{
    public interface IEmailService
    {
        Task EnviarCorreoAsync(CorreoSimulado correo);
    }

    public class SmtpEmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public SmtpEmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task EnviarCorreoAsync(CorreoSimulado correo)
        {
            var emailSettings = _config.GetSection("EmailSettings");
            var smtpServer = emailSettings["SmtpServer"];
            var port = int.Parse(emailSettings["Port"] ?? "587");
            var senderName = emailSettings["SenderName"];
            var senderEmail = emailSettings["SenderEmail"];
            var password = emailSettings["Password"];

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(senderName, senderEmail));
            message.To.Add(new MailboxAddress("", correo.Para));
            message.Subject = correo.Asunto;

            var builder = new BodyBuilder { HtmlBody = correo.Cuerpo };
            message.Body = builder.ToMessageBody();

            using var client = new SmtpClient();
            
            // Forzamos STARTTLS ya que es el estándar para el puerto 587 en Office 365
            await client.ConnectAsync(smtpServer, port, SecureSocketOptions.StartTls);
            
            // En caso de que el servidor ofrezca OAuth2 pero tengamos usuario/password, eliminamos el mecanismo
            client.AuthenticationMechanisms.Remove("XOAUTH2");
            
            await client.AuthenticateAsync(senderEmail, password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
    }
}
