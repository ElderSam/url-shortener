# Deploy on Render.com

This guide provides step-by-step instructions to deploy the URL Shortener application on Render.com using Docker Hub.

## Prerequisites

- A [Render.com](https://render.com) account
- A [Docker Hub](https://hub.docker.com) account
- Docker installed locally

## Step 1: Create PostgreSQL Database on Render

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **PostgreSQL**
3. Configure and create the database
4. **Important**: Copy the **External Database URL** (you'll need it for local `.env`)

## Step 2: Update Local .env File

Update your `.env` file with the Render PostgreSQL connection:

```env
DATABASE_URL=postgresql://user:password@host/database
```

Replace with your External Database URL from Step 1.

## Step 3: Build Docker Image Locally

```bash
docker build -t your-dockerhub-username/url-shortener .
```

Verify the image was created:

```bash
docker images
```

## Step 4: Push to Docker Hub

```bash
docker push your-dockerhub-username/url-shortener
```

Verify on Docker Hub: [https://hub.docker.com/repositories/your-username](https://hub.docker.com/repositories/your-username)

## Step 5: Create Web Service on Render

1. In Render Dashboard, click **New +** → **Web Service**
2. Choose **Deploy an existing image from a registry**
3. Configure:
   - **Image URL**: `docker.io/your-dockerhub-username/url-shortener:latest`
   - **Name**: Choose a name for your service
   - **Region**: Same as your database
   - **Plan**: Free or paid

## Step 6: Configure Environment Variables

In the **Environment** section of your Web Service, add the variables of the .env.  
NOTE: Ensure you are pointing to the production database. See every variable.

**Generate JWT_SECRET**:
```bash
openssl rand -base64 32
```

## Step 7: Deploy

Click **Create Web Service**. Render will:
- Pull your Docker image from Docker Hub
- Start the application
- Run migrations automatically (configured in Dockerfile)

## Step 8: Test Your Deployment

1. Visit: `https://your-service-name.onrender.com`
2. Expected response: `{"message":"URL Shortener API is running"}`
3. Access Swagger docs: `https://your-service-name.onrender.com/api`

## Updating Your Application

To deploy updates:

1. Make your code changes
2. Rebuild Docker image:
   ```bash
   docker build -t your-dockerhub-username/url-shortener .
   ```
3. Push to Docker Hub:
   ```bash
   docker push your-dockerhub-username/url-shortener
   ```
4. In Render Dashboard, go to your Web Service
5. Click **Manual Deploy** → **Deploy latest commit**
6. Render will pull the updated image and redeploy

## Troubleshooting

### Database Connection Issues
- Verify you're using the **External Database URL** in your `.env`
- Ensure database and web service are in the same region
- Check database status on Render Dashboard

### Docker Image Not Found
- Verify image was pushed: `docker images`
- Check Docker Hub repository is public
- Ensure correct image URL: `docker.io/username/image:latest`

### Application Startup Errors
- Check Render logs: Dashboard → Service → Logs
- Verify all environment variables are set
- Ensure `DATABASE_URL` is accessible

### Migrations Failed
Run manually via Shell:
```bash
npx prisma migrate deploy
```

## Important Notes

- **Free Tier**: App sleeps after 15 minutes (~30s cold start)
- **PostgreSQL Free**: 90-day expiration (backup data before expiry)
- **HTTPS**: Automatically enabled
- **Logs**: Real-time on Dashboard

## Resources

- [Render Documentation](https://render.com/docs)
- [Docker Hub](https://hub.docker.com)
- [Render PostgreSQL](https://render.com/docs/databases)
