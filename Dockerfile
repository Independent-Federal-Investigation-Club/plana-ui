# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production
RUN bun run build

# copy production dependencies and built application into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/package.json .
# Next.js needs TypeScript to load next.config.ts at runtime
# Copy TypeScript from dev dependencies (it's needed to load the TS config file)
COPY --from=install /temp/dev/node_modules/typescript node_modules/typescript
COPY --from=prerelease /usr/src/app/.next .next
COPY --from=prerelease /usr/src/app/public public
COPY --from=prerelease /usr/src/app/src src
COPY --from=prerelease /usr/src/app/next.config.ts .
COPY --from=prerelease /usr/src/app/postcss.config.mjs .
COPY --from=prerelease /usr/src/app/tsconfig.json .

# Copy entrypoint script for runtime environment injection
COPY docker-entrypoint.sh /usr/src/app/docker-entrypoint.sh

# Create cache directory with proper permissions for Next.js image optimization
# Also ensure public directory is writable for runtime config generation
RUN mkdir -p /usr/src/app/.next/cache/images && \
    chmod +x /usr/src/app/docker-entrypoint.sh && \
    chown -R bun:bun /usr/src/app

# run the app
USER bun
EXPOSE 3000/tcp
ENV NODE_ENV=production
ENV PORT=3000

# Use entrypoint to generate runtime config before starting the app
ENTRYPOINT ["/usr/src/app/docker-entrypoint.sh"]
CMD [ "bun", "run", "start" ]