'use strict'

const path = require('path')
const micromatch = require('micromatch')
const { getConfig } = require('./getConfig')
const resolveGitDir = require('./resolveGitDir')

const debug = require('debug')('lint-staged:gen-tasks')

module.exports = function generateTasks(config, relFiles) {
  debug('Generating linter tasks')

  const normalizedConfig = getConfig(config) // Ensure we have a normalized config
  const { linters, globOptions } = normalizedConfig
  const ignorePatterns = normalizedConfig.ignore.map(pattern => `!${pattern}`)

  const gitDir = resolveGitDir()
  const files = relFiles.map(file => path.resolve(gitDir, file))

  return Object.keys(linters).map(pattern => {
    const patterns = [pattern].concat(ignorePatterns)
    const commands = linters[pattern]

    const fileList = micromatch(
      files
        // Make the paths relative to gitDir for filtering
        .map(file => path.relative(gitDir, file)),
      patterns,
      globOptions
    )
      // Return absolute path after the filter is run
      .map(file => path.resolve(gitDir, file))

    const task = { pattern, commands, fileList }
    debug('Generated task: \n%O', task)

    return task
  })
}
